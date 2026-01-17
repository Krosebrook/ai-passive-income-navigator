import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import LIFECYCLE_CONFIG from './lifecycleFlowConfig.js';

/**
 * Evaluates current lifecycle state and triggers transitions if needed
 * Integrates data from activation, retention, and power-user states
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch or create lifecycle state
        const lifecycleStates = await base44.entities.LifecycleState.filter({
            user_email: user.email
        });

        let lifecycleState = lifecycleStates[0];

        // Fetch context from other state entities
        const [activationStates, retentionStates, powerUserStates] = await Promise.all([
            base44.entities.ActivationState.filter({ user_email: user.email }),
            base44.entities.RetentionState.filter({ user_email: user.email }),
            base44.entities.PowerUserState.filter({ user_email: user.email })
        ]);

        const activationState = activationStates[0];
        const retentionState = retentionStates[0];
        const powerUserState = powerUserStates[0];

        // Calculate engagement signals
        const signals = calculateEngagementSignals(
            activationState,
            retentionState,
            powerUserState
        );

        // Detect intent
        const intent = detectIntent(activationState, retentionState, signals);

        // Determine current state
        const newState = determineLifecycleState(
            lifecycleState?.current_state || 'new',
            signals,
            activationState,
            powerUserState,
            LIFECYCLE_CONFIG
        );

        // Create or update lifecycle state
        if (!lifecycleState) {
            lifecycleState = await base44.entities.LifecycleState.create({
                user_email: user.email,
                current_state: newState,
                state_entered_at: new Date().toISOString(),
                engagement_signals: signals,
                intent_signals: intent,
                created_at: new Date().toISOString()
            });
        } else if (newState !== lifecycleState.current_state) {
            // State transition detected
            const previousStates = lifecycleState.previous_states || [];
            const durationDays = Math.floor(
                (Date.now() - new Date(lifecycleState.state_entered_at).getTime()) / (1000 * 60 * 60 * 24)
            );

            previousStates.push({
                state: lifecycleState.current_state,
                entered_at: lifecycleState.state_entered_at,
                exited_at: new Date().toISOString(),
                duration_days: durationDays
            });

            lifecycleState = await base44.entities.LifecycleState.update(lifecycleState.id, {
                current_state: newState,
                state_entered_at: new Date().toISOString(),
                previous_states: previousStates,
                engagement_signals: signals,
                intent_signals: intent,
                state_context: {
                    activation_milestone_date: activationState?.activated_at,
                    power_user_since: powerUserState?.power_user_since,
                    days_since_onboarding: calculateDaysSinceOnboarding(activationState),
                    days_in_current_state: 0,
                    lifecycle_stage: determineLifecycleStage(newState)
                }
            });
        } else {
            // Update signals even if state hasn't changed
            lifecycleState = await base44.entities.LifecycleState.update(lifecycleState.id, {
                engagement_signals: signals,
                intent_signals: intent
            });
        }

        return Response.json({
            success: true,
            lifecycle_state: lifecycleState,
            state_changed: newState !== (lifecycleStates[0]?.current_state || 'new'),
            new_state: newState,
            signals,
            intent
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function calculateEngagementSignals(activation, retention, powerUser) {
    const retention_metrics = retention?.engagement_metrics || {};
    const powerUser_signals = powerUser?.power_user_signals || {};

    return {
        sessions_last_7_days: retention_metrics.total_sessions || 0,
        sessions_last_30_days: retention_metrics.total_sessions || 0,
        session_frequency_trend: estimateFrequencyTrend(retention_metrics),
        completed_actions_last_7_days: calculateCompletedActions(retention),
        nudges_dismissed_last_30_days: retention?.nudges?.dismissed_nudges?.length || 0,
        habit_loops_activated_last_30_days: (retention?.habit_loops?.discovery_loop?.trigger_count || 0) +
                                            (retention?.habit_loops?.insight_loop?.trigger_count || 0) +
                                            (retention?.habit_loops?.social_proof_loop?.trigger_count || 0),
        flow_abandonment_count: 0
    };
}

function estimateFrequencyTrend(metrics) {
    // Simplified: would need more data for real trend
    if (!metrics.total_sessions) return 'declining';
    if (metrics.weekly_streaks > 2) return 'increasing';
    return 'stable';
}

function calculateCompletedActions(retention) {
    const loops = retention?.habit_loops || {};
    return (loops.discovery_loop?.completed_actions || 0) +
           (loops.insight_loop?.completed_actions || 0) +
           (loops.social_proof_loop?.completed_actions || 0);
}

function detectIntent(activation, retention, signals) {
    const path = activation?.activation_path || 'unknown';
    let detected_intent = 'mixed';

    if (path === 'deal_first') detected_intent = 'deal_discovery';
    if (path === 'portfolio_first') detected_intent = 'portfolio_building';
    if (path === 'community_first') detected_intent = 'networking';

    return {
        detected_intent,
        intent_confidence: Math.min(signals.completed_actions_last_7_days / 5, 1.0),
        intent_shift_at: null
    };
}

function determineLifecycleState(currentState, signals, activation, powerUser, config) {
    // Check for transitions in priority order
    
    // Check if power user
    if (powerUser?.power_user_status === 'power_user') {
        return 'power_user';
    }

    // Check if dormant
    if (signals.session_frequency_trend === 'declining' && 
        signals.nudges_dismissed_last_30_days > signals.habit_loops_activated_last_30_days * 2) {
        return 'dormant';
    }

    // Check if at-risk
    if (currentState === 'engaged' && signals.session_frequency_trend === 'declining') {
        return 'at_risk';
    }

    // Check if returning
    if (currentState === 'dormant' && signals.completed_actions_last_7_days > 0) {
        return 'returning';
    }

    // Check if engaged
    if (activation?.activated && signals.sessions_last_7_days >= 2 && 
        signals.habit_loops_activated_last_30_days > 0) {
        return 'engaged';
    }

    // Check if activated
    if (activation?.activated) {
        return 'activated';
    }

    return 'new';
}

function determineLifecycleStage(state) {
    const stageMap = {
        new: 'early',
        activated: 'early',
        engaged: 'growth',
        power_user: 'mature',
        at_risk: 'churn_risk',
        dormant: 'churn_risk',
        returning: 'growth'
    };
    return stageMap[state] || 'early';
}

function calculateDaysSinceOnboarding(activation) {
    if (!activation?.started_at) return 0;
    return Math.floor(
        (Date.now() - new Date(activation.started_at).getTime()) / (1000 * 60 * 60 * 24)
    );
}