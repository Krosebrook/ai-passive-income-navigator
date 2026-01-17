import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Send Deal Reminders
 * Automated function to check and send pending reminders
 * Should be run via scheduled automation (e.g., daily)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date().toISOString();

    // Fetch pending reminders due now or in the past
    const allReminders = await base44.asServiceRole.entities.DealReminder.list();
    const dueReminders = allReminders.filter(r => 
      !r.is_sent && new Date(r.reminder_date) <= new Date(now)
    );

    const sentReminders = [];

    for (const reminder of dueReminders) {
      try {
        // Get deal info
        const deals = await base44.asServiceRole.entities.DealPipeline.filter({ 
          id: reminder.deal_pipeline_id 
        });
        const deal = deals[0];

        if (!deal) continue;

        // Send email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: reminder.recipient_email,
          subject: `Reminder: ${reminder.reminder_type.replace('_', ' ')} - ${deal.deal_name}`,
          body: `
            <h2>Deal Reminder</h2>
            <p><strong>Deal:</strong> ${deal.deal_name}</p>
            <p><strong>Stage:</strong> ${deal.stage}</p>
            <p><strong>Type:</strong> ${reminder.reminder_type}</p>
            <p><strong>Message:</strong> ${reminder.message}</p>
            <p>Log in to view and take action on this deal.</p>
          `
        });

        // Mark as sent
        await base44.asServiceRole.entities.DealReminder.update(reminder.id, {
          is_sent: true
        });

        sentReminders.push(reminder.id);
      } catch (error) {
        console.error(`Failed to send reminder ${reminder.id}:`, error);
      }
    }

    return Response.json({
      success: true,
      reminders_sent: sentReminders.length,
      reminder_ids: sentReminders
    });
  } catch (error) {
    console.error('Reminder sending error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});