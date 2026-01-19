import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dealId, updateType, details } = await req.json();

    // Get deal details
    const deals = await base44.entities.DealPipeline.filter({ id: dealId });
    if (deals.length === 0) {
      return Response.json({ error: 'Deal not found' }, { status: 404 });
    }

    const deal = deals[0];
    
    // Create notification based on update type
    let notificationMessage = '';
    let notificationType = 'info';

    switch (updateType) {
      case 'stage_change':
        notificationMessage = `Deal "${deal.deal_name}" moved to ${details.newStage}`;
        notificationType = 'info';
        break;
      case 'task_due_soon':
        notificationMessage = `Task "${details.taskTitle}" is due soon on "${deal.deal_name}"`;
        notificationType = 'warning';
        break;
      case 'task_completed':
        notificationMessage = `Task "${details.taskTitle}" completed on "${deal.deal_name}"`;
        notificationType = 'success';
        break;
      case 'deal_assigned':
        notificationMessage = `You've been assigned to deal "${deal.deal_name}"`;
        notificationType = 'info';
        break;
      default:
        notificationMessage = `Update on deal "${deal.deal_name}"`;
    }

    // Send email notification if assigned user is different from current user
    if (deal.assigned_to && deal.assigned_to !== user.email) {
      await base44.integrations.Core.SendEmail({
        to: deal.assigned_to,
        subject: `Deal Update: ${deal.deal_name}`,
        body: `${notificationMessage}\n\nView deal details in your pipeline.`
      });
    }

    // Create in-app notification (using InvestmentAlert entity as notification store)
    await base44.entities.InvestmentAlert.create({
      title: 'Deal Pipeline Update',
      description: notificationMessage,
      severity: notificationType === 'warning' ? 'high' : 'medium',
      alert_type: 'portfolio_risk',
      status: 'active',
      generated_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      message: 'Notification sent'
    });

  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ 
      error: error.message || 'Failed to send notification' 
    }, { status: 500 });
  }
});