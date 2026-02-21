import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin authorization
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { backup_id, restore_options = {} } = await req.json();
    
    if (!backup_id) {
      return Response.json({ error: 'backup_id is required' }, { status: 400 });
    }

    console.log(`Starting restore from backup: ${backup_id}`);
    
    // Fetch backup
    const backups = await base44.asServiceRole.entities.UserBackup.filter({
      id: backup_id
    });
    
    if (backups.length === 0) {
      return Response.json({ error: 'Backup not found' }, { status: 404 });
    }
    
    const backup = backups[0];
    const { backup_data, user_email } = backup;
    
    if (!backup_data || !backup_data.data) {
      return Response.json({ error: 'Invalid backup data' }, { status: 400 });
    }

    const restoredCounts = {};

    // Restore preferences (update if exists, create if not)
    if (backup_data.data.preferences?.length > 0 && restore_options.restore_preferences !== false) {
      const existing = await base44.asServiceRole.entities.UserPreferences.filter({
        created_by: user_email
      });
      
      if (existing.length > 0) {
        // Update existing
        await base44.asServiceRole.entities.UserPreferences.update(
          existing[0].id,
          backup_data.data.preferences[0]
        );
        restoredCounts.preferences = 1;
      } else {
        // Create new
        await base44.asServiceRole.entities.UserPreferences.create(
          backup_data.data.preferences[0]
        );
        restoredCounts.preferences = 1;
      }
    }

    // Restore investments
    if (backup_data.data.investments?.length > 0 && restore_options.restore_investments !== false) {
      for (const investment of backup_data.data.investments) {
        delete investment.id; // Let system generate new ID
        await base44.asServiceRole.entities.Investment.create(investment);
      }
      restoredCounts.investments = backup_data.data.investments.length;
    }

    // Restore goals
    if (backup_data.data.goals?.length > 0 && restore_options.restore_goals !== false) {
      for (const goal of backup_data.data.goals) {
        delete goal.id;
        await base44.asServiceRole.entities.FinancialGoal.create(goal);
      }
      restoredCounts.goals = backup_data.data.goals.length;
    }

    // Restore watchlists
    if (backup_data.data.watchlists?.length > 0 && restore_options.restore_watchlists !== false) {
      for (const watchlist of backup_data.data.watchlists) {
        delete watchlist.id;
        await base44.asServiceRole.entities.SharedWatchlist.create(watchlist);
      }
      restoredCounts.watchlists = backup_data.data.watchlists.length;
    }

    console.log(`Restore completed:`, restoredCounts);

    return Response.json({
      success: true,
      user_email,
      backup_timestamp: backup_data.timestamp,
      restored_counts: restoredCounts,
      restore_timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Restore failed:', error);
    
    try {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.ErrorLog.create({
        error_type: 'restore_failure',
        error_message: error.message,
        error_details: JSON.stringify({
          stack: error.stack,
          name: error.name
        }),
        function_name: 'restoreBackup'
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return Response.json({
      error: error.message,
      details: 'Restore failed. Error has been logged.'
    }, { status: 500 });
  }
});