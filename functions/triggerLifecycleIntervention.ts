import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import LIFECYCLE_CONFIG from './lifecycleFlowConfig.js';

/**
 * Triggers appropriate intervention based on lifecycle state and churn risk
 * Never surfaces shame or pressure language
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch lifecycle state
        const lifecycleStates = await base44.entities.LifecycleState.filter({
            user_email: user.email
        });

        if (lifecycleStates.length === 0) {
            return Response.json({ error: 'No lifecycle state' }, { status: 404 });
        }

        const lifecycleState = lifecycleStates[0];
        const currentState = lifecycleState.current_state;
        const churnScore = lifecycleState.churn_risk?.score || 0;

        // Check if user should receive intervention
        if (lifecycleState.suppressed_interventions?.includes(currentState)) {
            return Response.json({
                triggered: false,
                reason: 'Interventions suppressed for this state'
            });
        }

        // Get playbook for current state
        const playbook = LIFECYCLE_CONFIG.intervention_playbooks[currentState];

        if (!playbook) {
            return Response.json({
                triggered: false,
                reason: `No interventions defined for state: ${currentState}`
            });
        }

        // Select intervention based on state and risk
        const intervention = selectIntervention(playbook, lifecycleState, churnScore);

        if (!intervention) {
            return Response.json({
                triggered: false,
                reason: 'No eligible interventions for current context'
            });
        }

        // Update lifecycle state
        const activeInterventions = lifecycleState.active_interventions || [];
        activeInterventions.push({
            intervention_id: intervention.id,
            triggered_at: new Date().toISOString(),
            delivered: false
        });

        await base44.entities.LifecycleState.update(lifecycleState.id, {
            active_interventions: activeInterventions
        });

        return Response.json({
            success: true,
            triggered: true,
            intervention,
            lifecycle_state: currentState
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function selectIntervention(playbook, lifecycleState, churnScore) {
    const interventions = playbook.interventions || [];
    const suppressed = lifecycleState.suppressed_interventions || [];

    // Filter eligible interventions
    let eligible = interventions.filter(
        i => !suppressed.includes(i.id)
    );

    if (eligible.length === 0) return null;

    // Prioritize by urgency if at risk
    if (churnScore > 60) {
        // Return most aggressive intervention for high-risk users
        return eligible[eligible.length - 1];
    }

    // Return first eligible
    return eligible[0];
}