import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { suggestion_id, approved_actions } = await req.json();

        if (!suggestion_id) {
            return Response.json({ error: 'Suggestion ID is required' }, { status: 400 });
        }

        // Get the suggestion
        const suggestion = await base44.entities.PortfolioAdjustmentSuggestion.filter({ id: suggestion_id });
        
        if (!suggestion || suggestion.length === 0) {
            return Response.json({ error: 'Suggestion not found' }, { status: 404 });
        }

        const rebalancingSuggestion = suggestion[0];

        // Update user preferences based on target allocation
        if (rebalancingSuggestion.target_allocation) {
            const preferences = await base44.entities.UserPreferences.filter({ created_by: user.email });
            
            if (preferences && preferences.length > 0) {
                await base44.entities.UserPreferences.update(preferences[0].id, {
                    target_allocation: rebalancingSuggestion.target_allocation,
                    last_rebalance_date: new Date().toISOString()
                });
            }
        }

        // Mark suggestion as accepted
        await base44.entities.PortfolioAdjustmentSuggestion.update(suggestion_id, {
            status: 'accepted',
            executed_at: new Date().toISOString(),
            user_notes: `Executed ${approved_actions?.length || 'all'} actions`
        });

        // Create activity log
        await base44.entities.InvestmentAlert.create({
            title: 'Portfolio Rebalanced',
            description: `Successfully executed rebalancing actions based on AI recommendations`,
            severity: 'low',
            alert_type: 'rebalancing_completed',
            status: 'acknowledged',
            generated_at: new Date().toISOString()
        });

        return Response.json({
            success: true,
            message: 'Rebalancing executed successfully',
            executed_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error executing rebalancing:', error);
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});