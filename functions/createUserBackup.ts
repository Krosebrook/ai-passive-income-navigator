import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Collect all user data
    const backupData = {
      user: {
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_date
      },
      portfolio: await base44.entities.PortfolioIdea?.filter?.({ created_by: user.email }) || [],
      preferences: await base44.entities.UserPreferences?.filter?.({ created_by: user.email }) || [],
      financials: await base44.entities.FinancialData?.filter?.({ created_by: user.email }) || [],
      bookmarks: await base44.entities.Bookmark?.filter?.({ created_by: user.email }) || [],
      backup_timestamp: new Date().toISOString()
    };

    const backupSize = new TextEncoder().encode(JSON.stringify(backupData)).length / (1024 * 1024);

    // Store backup record
    const backup = await base44.asServiceRole.entities.UserBackup.create({
      user_email: user.email,
      size_mb: backupSize,
      backup_type: 'automatic',
      status: 'completed',
      data_snapshot: backupData
    });

    // Clean up old backups (keep last 30)
    const allBackups = await base44.asServiceRole.entities.UserBackup.filter({ user_email: user.email });
    if (allBackups.length > 30) {
      const toDelete = allBackups.slice(30);
      for (const oldBackup of toDelete) {
        await base44.asServiceRole.entities.UserBackup.delete(oldBackup.id);
      }
    }

    return Response.json({
      success: true,
      backup_id: backup.id,
      size_mb: backupSize,
      created_at: backup.created_date
    });
  } catch (error) {
    console.error('Backup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});