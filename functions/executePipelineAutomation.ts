import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Execute pipeline automation rules when deal stage changes
 * Triggered by entity automation on DealPipeline updates
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { event, data, old_data } = await req.json();
    
    // Only process stage changes
    if (event.type !== 'update' || !old_data || data.stage === old_data.stage) {
      return Response.json({ message: 'No stage change detected' });
    }

    const dealId = data.id;
    const newStage = data.stage;
    
    // Fetch all active automation rules for this stage
    const rules = await base44.asServiceRole.entities.PipelineAutomationRule.filter({
      trigger_stage: newStage,
      is_active: true
    });

    if (rules.length === 0) {
      return Response.json({ message: 'No active rules for this stage' });
    }

    const executedActions = [];

    // Execute each rule's actions
    for (const rule of rules) {
      for (const action of rule.actions || []) {
        try {
          switch (action.action_type) {
            case 'create_task':
              await base44.asServiceRole.entities.DealTask.create({
                deal_pipeline_id: dealId,
                title: action.config.task_title || 'Automated Task',
                description: action.config.task_description || '',
                priority: action.config.task_priority || 'medium',
                status: 'pending',
                assigned_to: data.assigned_to || data.created_by,
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              });
              executedActions.push(`Created task: ${action.config.task_title}`);
              break;

            case 'create_reminder':
              const reminderDate = new Date();
              reminderDate.setDate(reminderDate.getDate() + (action.config.reminder_days_offset || 3));
              
              await base44.asServiceRole.entities.DealReminder.create({
                deal_pipeline_id: dealId,
                reminder_type: 'stage_review',
                reminder_date: reminderDate.toISOString(),
                message: action.config.reminder_message || 'Review deal progress',
                recipient_email: data.assigned_to || data.created_by
              });
              executedActions.push(`Created reminder for ${reminderDate.toLocaleDateString()}`);
              break;

            case 'update_priority':
              await base44.asServiceRole.entities.DealPipeline.update(dealId, {
                priority: action.config.new_priority
              });
              executedActions.push(`Updated priority to ${action.config.new_priority}`);
              break;

            case 'send_notification':
              // Send email notification
              if (data.assigned_to) {
                await base44.asServiceRole.integrations.Core.SendEmail({
                  to: data.assigned_to,
                  subject: `Deal Stage Update: ${data.deal_name}`,
                  body: action.config.notification_message || 
                    `Your deal "${data.deal_name}" has moved to ${newStage} stage.`
                });
                executedActions.push('Sent email notification');
              }
              break;
          }
        } catch (error) {
          console.error(`Failed to execute action ${action.action_type}:`, error);
        }
      }
    }

    return Response.json({
      success: true,
      deal_id: dealId,
      new_stage: newStage,
      rules_executed: rules.length,
      actions_executed: executedActions
    });

  } catch (error) {
    console.error('Pipeline automation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});