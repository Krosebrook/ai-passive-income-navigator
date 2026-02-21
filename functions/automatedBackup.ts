import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin authorization
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { user_email, backup_type = 'full' } = await req.json();
    
    // Validate input
    if (!user_email) {
      return Response.json({ error: 'user_email is required' }, { status: 400 });
    }

    console.log(`Starting ${backup_type} backup for user: ${user_email}`);
    
    const backupData = {
      timestamp: new Date().toISOString(),
      user_email,
      backup_type,
      data: {}
    };

    // Backup UserPreferences
    const preferences = await base44.asServiceRole.entities.UserPreferences.filter({
      created_by: user_email
    });
    backupData.data.preferences = preferences;

    // Backup Investments
    const investments = await base44.asServiceRole.entities.Investment.filter({
      user_email
    });
    backupData.data.investments = investments;

    // Backup SourcedDealOpportunity
    const deals = await base44.asServiceRole.entities.SourcedDealOpportunity.filter({
      created_by: user_email
    });
    backupData.data.deals = deals;

    // Backup FinancialGoal
    const goals = await base44.asServiceRole.entities.FinancialGoal.filter({
      user_email
    });
    backupData.data.goals = goals;

    // Backup SharedWatchlist
    const watchlists = await base44.asServiceRole.entities.SharedWatchlist.filter({
      owner_email: user_email
    });
    backupData.data.watchlists = watchlists;

    // Backup MarketAlert
    const alerts = await base44.asServiceRole.entities.MarketAlert.filter({
      created_by: user_email
    });
    backupData.data.alerts = alerts;

    // Backup UserAchievement
    const achievements = await base44.asServiceRole.entities.UserAchievement.filter({
      user_email
    });
    backupData.data.achievements = achievements;

    // Backup GamificationEvent
    const events = await base44.asServiceRole.entities.GamificationEvent.filter({
      user_email
    });
    backupData.data.events = events;

    // Calculate backup size
    const backupSize = JSON.stringify(backupData).length;
    
    // Create backup record
    const backupRecord = await base44.asServiceRole.entities.UserBackup.create({
      user_email,
      backup_type,
      backup_size: backupSize,
      entities_backed_up: Object.keys(backupData.data),
      backup_data: backupData,
      status: 'completed',
      backup_timestamp: new Date().toISOString()
    });

    console.log(`Backup completed. Size: ${backupSize} bytes, ID: ${backupRecord.id}`);

    return Response.json({
      success: true,
      backup_id: backupRecord.id,
      backup_size: backupSize,
      entities_count: {
        preferences: preferences.length,
        investments: investments.length,
        deals: deals.length,
        goals: goals.length,
        watchlists: watchlists.length,
        alerts: alerts.length,
        achievements: achievements.length,
        events: events.length
      },
      timestamp: backupData.timestamp
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