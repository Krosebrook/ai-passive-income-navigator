import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import LIFECYCLE_CONFIG from './lifecycleFlowConfig.js';

/**
 * Detects churn risk using lightweight behavioral scoring
 * Never surfaces "churn" language to users
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch states
        const [lifecycleStates, retentionStates] = await Promise.all([
            base44.entities.LifecycleState.filter({ user_email: user.email }),
            base44.entities.RetentionState.filter({ user_email: user.email })
        ]);

        const lifecycleState = lifecycleStates[0];
        const retentionState = retentionStates[0];

        if (!lifecycleState) {
            return Response.json({ error: 'No lifecycle state' }, { status: 404 });
        }

        // Calculate churn score
        const churnScore = calculateChurnScore(
            lifecycleState,
            retentionState,
            LIFECYCLE_CONFIG
        );

        // Determine trend
        const trend = calculateChurnTrend(lifecycleState, churnScore);

        // Identify risk factors
        const riskFactors = identifyRiskFactors(lifecycleState, retentionState);

        // Get primary risk signal
        const primaryRisk = riskFactors[0] || null;

        // Update lifecycle state with churn risk
        await base44.entities.LifecycleState.update(lifecycleState.id, {
            churn_risk: {
                score: churnScore,
                trend,
                primary_risk_signal: primaryRisk,
                risk_factors: riskFactors,
                last_calculated_at: new Date().toISOString()
            }
        });

        const riskCategory = categorizeRisk(churnScore);

        return Response.json({
            success: true,
            churn_score: churnScore,
            risk_category: riskCategory,
            trend,
            primary_risk_signal: primaryRisk,
            risk_factors: riskFactors,
            recommended_intervention: getRecommendedIntervention(riskCategory)
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function calculateChurnScore(lifecycleState, retentionState, config) {
    const signals = lifecycleState.engagement_signals || {};
    const baseFactors = config.churn_risk_model.base_factors || [];

    let score = 0;
    let factorScores = {};

    // Session frequency decline
    const sessionDecline = calculateSessionDecline(retentionState);
    const sessionDeclineFactor = baseFactors.find(f => f.factor === 'session_frequency_decline');
    if (sessionDeclineFactor && sessionDecline < -0.4) {
        factorScores.session_frequency_decline = (sessionDecline / -0.4) * 100 * sessionDeclineFactor.weight;
    }

    // Action abandonment
    const abandonmentRate = calculateAbandonmentRate(retentionState);
    const abandonmentFactor = baseFactors.find(f => f.factor === 'action_abandonment');
    if (abandonmentFactor && abandonmentRate > 0.6) {
        factorScores.action_abandonment = (abandonmentRate / 1.0) * 100 * abandonmentFactor.weight;
    }

    // Nudge dismissal
    const dismissalRate = calculateDismissalRate(lifecycleState);
    const dismissalFactor = baseFactors.find(f => f.factor === 'nudge_dismissal_rate');
    if (dismissalFactor && dismissalRate > 0.7) {
        factorScores.nudge_dismissal = (dismissalRate / 1.0) * 100 * dismissalFactor.weight;
    }

    // Habit loop inactivity
    const loopInactivity = calculateLoopInactivity(retentionState);
    const loopFactor = baseFactors.find(f => f.factor === 'habit_loop_inactivity');
    if (loopFactor && loopInactivity > 14) {
        factorScores.habit_loop_inactivity = (loopInactivity / 30) * 100 * loopFactor.weight;
    }

    // Time since last session
    const daysSinceSession = calculateDaysSinceSession(retentionState);
    const timeFactor = baseFactors.find(f => f.factor === 'time_since_last_session');
    if (timeFactor && daysSinceSession > 7) {
        factorScores.time_since_session = (daysSinceSession / 30) * 100 * timeFactor.weight;
    }

    score = Math.min(
        Object.values(factorScores).reduce((a, b) => a + b, 0),
        100
    );

    return Math.round(score);
}

function calculateSessionDecline(retentionState) {
    // Simplified: would need historical data for real calculation
    if (!retentionState) return 0;
    const trend = retentionState.engagement_metrics?.estimated_session_frequency;
    if (trend === 'very_low') return -0.8;
    if (trend === 'low') return -0.5;
    return 0;
}

function calculateAbandonmentRate(retentionState) {
    // Estimate from nudges dismissed
    const shown = retentionState?.nudges?.shown_nudges?.length || 0;
    const dismissed = retentionState?.nudges?.dismissed_nudges?.length || 0;
    if (shown === 0) return 0;
    return dismissed / shown;
}

function calculateDismissalRate(lifecycleState) {
    const nudgesDismissed = lifecycleState.engagement_signals?.nudges_dismissed_last_30_days || 0;
    const habitsActivated = lifecycleState.engagement_signals?.habit_loops_activated_last_30_days || 1;
    return nudgesDismissed / habitsActivated;
}

function calculateLoopInactivity(retentionState) {
    if (!retentionState) return 0;
    const loops = retentionState.habit_loops || {};
    const lastTrigger = Math.max(
        new Date(loops.discovery_loop?.last_triggered_at || 0).getTime(),
        new Date(loops.insight_loop?.last_triggered_at || 0).getTime(),
        new Date(loops.social_proof_loop?.last_triggered_at || 0).getTime()
    );
    return Math.floor((Date.now() - lastTrigger) / (1000 * 60 * 60 * 24));
}

function calculateDaysSinceSession(retentionState) {
    if (!retentionState?.engagement_metrics?.last_session_at) return 0;
    return Math.floor(
        (Date.now() - new Date(retentionState.engagement_metrics.last_session_at).getTime()) / (1000 * 60 * 60 * 24)
    );
}

function calculateChurnTrend(lifecycleState, currentScore) {
    const prevScore = lifecycleState.churn_risk?.score || 0;
    const diff = currentScore - prevScore;

    if (diff > 10) return 'declining';
    if (diff < -10) return 'improving';
    return 'stable';
}

function identifyRiskFactors(lifecycleState, retentionState) {
    const factors = [];

    const daysSinceSession = calculateDaysSinceSession(retentionState);
    if (daysSinceSession > 7) factors.push('low_session_frequency');

    if (calculateDismissalRate(lifecycleState) > 0.7) {
        factors.push('high_nudge_dismissal');
    }

    if (calculateLoopInactivity(retentionState) > 14) {
        factors.push('habit_loop_inactivity');
    }

    if (lifecycleState.engagement_signals?.session_frequency_trend === 'declining') {
        factors.push('engagement_declining');
    }

    return factors;
}

function categorizeRisk(score) {
    if (score < 30) return 'low_risk';
    if (score < 60) return 'medium_risk';
    if (score < 85) return 'high_risk';
    return 'critical_risk';
}

function getRecommendedIntervention(riskCategory) {
    const interventions = {
        low_risk: 'none',
        medium_risk: 'value_reminder',
        high_risk: 'relevance_reset',
        critical_risk: 'win_back_sequence'
    };
    return interventions[riskCategory];
}