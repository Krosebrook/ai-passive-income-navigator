import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin authorization
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // Support both scheduled (no payload) and manual (user_email provided) invocations
    let body = {};
    try { body = await req.json(); } catch (_) {}
    const { user_email, backup_type = 'full' } = body;

    // If user_email is provided, back up that single user; otherwise back up ALL users
    let usersToBackup = [];
    if (user_email) {
      usersToBackup = [{ email: user_email }];
    } else {
      console.log('No user_email provided — running full backup for all users');
      usersToBackup = await base44.asServiceRole.entities.User.list();
    }

    const results = [];

    for (const u of usersToBackup) {
      const email = u.email;
      console.log(`Starting ${backup_type} backup for user: ${email}`);

      const backupData = {
        timestamp: new Date().toISOString(),
        user_email: email,
        backup_type,
        data: {}
      };

      const [preferences, investments, deals, goals, watchlists, alerts, achievements, events] =
        await Promise.all([
          base44.asServiceRole.entities.UserPreferences.filter({ created_by: email }),
          base44.asServiceRole.entities.Investment.filter({ user_email: email }),
          base44.asServiceRole.entities.SourcedDealOpportunity.filter({ created_by: email }),
          base44.asServiceRole.entities.FinancialGoal.filter({ user_email: email }),
          base44.asServiceRole.entities.SharedWatchlist.filter({ owner_email: email }),
          base44.asServiceRole.entities.MarketAlert.filter({ created_by: email }),
          base44.asServiceRole.entities.UserAchievement.filter({ user_email: email }),
          base44.asServiceRole.entities.GamificationEvent.filter({ user_email: email }),
        ]);

      backupData.data = { preferences, investments, deals, goals, watchlists, alerts, achievements, events };

      const backupSize = JSON.stringify(backupData).length;

      const backupRecord = await base44.asServiceRole.entities.UserBackup.create({
        user_email: email,
        backup_type,
        backup_size: backupSize,
        entities_backed_up: Object.keys(backupData.data),
        backup_data: backupData,
        status: 'completed',
        backup_timestamp: new Date().toISOString()
      });

      console.log(`Backup completed for ${email}. Size: ${backupSize} bytes, ID: ${backupRecord.id}`);
      results.push({ user_email: email, backup_id: backupRecord.id, backup_size: backupSize });
    }

    return Response.json({
      success: true,
      users_backed_up: results.length,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Backup failed:', error);
    
    // Log the error
    try {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.ErrorLog.create({
        error_type: 'backup_failure',
        error_message: error.message,
        error_details: JSON.stringify({
          stack: error.stack,
          name: error.name
        }),
        function_name: 'automatedBackup'
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return Response.json({
      error: error.message,
      details: 'Backup failed. Error has been logged.'
    }, { status: 500 });
  }
});