import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Evaluates 30-day retention progress and identifies active habit loops
 * Returns engagement metrics, churn risk, and recommended actions
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch retention state
        const retentionStates = await base44.entities.RetentionState.filter({
            user_email: user.email
        });

        if (retentionStates.length === 0) {
            return Response.json({
                retained: false,
                retention_day: 0,
                churn_risk: 'unknown'
            });
        }

        const retentionState = retentionStates[0];

        // Fetch activation state for context
        const activationStates = await base44.entities.ActivationState.filter({
            user_email: user.email
        });

        const activationState = activationStates[0];

        // Calculate engagement metrics
        const metrics = await calculateEngagementMetrics(retentionState);

        // Identify active habit loops
        const activeLoops = determineActiveLoops(retentionState, activationState, metrics);

        // Calculate churn risk
        const churnRisk = calculateChurnRisk(metrics);

        // Check retention milestone
        const isRetained = metrics.weekly_engagement_streak >= 1;

        return Response.json({
            success: true,
            retained: isRetained,
            retention_day: metrics.days_in_window,
            churn_risk: churnRisk,
            engagement_metrics: metrics,
            active_habit_loops: activeLoops,
            weekly_engagement_streak: metrics.weekly_engagement_streak,
            personalization_confidence: retentionState.personalization?.preference_confidence || 0.3,
            next_recommended_actions: generateRecommendations(activeLoops, metrics)
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function calculateEngagementMetrics(retentionState) {
    const engagement = retentionState.engagement_metrics || {};
    const createdAt = new Date(retentionState.created_at);
    const daysInWindow = Math.floor(
        (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const lastSessionTime = engagement.last_session_at 
        ? new Date(engagement.last_session_at).getTime() 
        : null;

    const daysSinceLastSession = lastSessionTime
        ? Math.floor((Date.now() - lastSessionTime) / (1000 * 60 * 60 * 24))
        : daysInWindow;

    // Estimate weekly engagement streak (simplified)
    const weeklyStreak = engagement.weekly_streaks || 0;
    const isCurrentlyActive = daysSinceLastSession <= 7;

    return {
        days_in_window: Math.min(daysInWindow, 30),
        total_sessions: engagement.total_sessions || 0,
        unique_days_active: engagement.unique_days_active || 0,
        consecutive_days_active: engagement.consecutive_days_active || 0,
        weekly_engagement_streak: isCurrentlyActive ? weeklyStreak + 1 : weeklyStreak,
        days_since_last_session: daysSinceLastSession,
        is_active_this_week: daysSinceLastSession <= 7,
        estimated_session_frequency: estimateFrequency(engagement.total_sessions, daysInWindow)
    };
}

function estimateFrequency(totalSessions, daysInWindow) {
    if (daysInWindow === 0) return 'unknown';
    const frequency = totalSessions / daysInWindow;
    if (frequency >= 0.5) return 'high'; // 3.5+ sessions/week
    if (frequency >= 0.2) return 'medium'; // 1.4+ sessions/week
    if (frequency >= 0.1) return 'low'; // 0.7+ sessions/week
    return 'very_low';
}

function determineActiveLoops(retentionState, activationState, metrics) {
    const loops = [];
    const habitLoops = retentionState.habit_loops || {};

    // Discovery loop: triggered by deal activity
    if (
        (activationState?.activation_path === 'deal_first' ||
         habitLoops.discovery_loop?.deals_saved_in_loop > 0) &&
        metrics.days_since_last_session <= 3
    ) {
        loops.push({
            id: 'discovery_loop',
            active: true,
            trigger_type: 'deal_activity',
            last_triggered: habitLoops.discovery_loop?.last_triggered_at,
            momentum: habitLoops.discovery_loop?.deals_saved_in_loop || 0
        });
    }

    // Insight loop: triggered by analytics/portfolio interest
    if (
        (activationState?.activation_path === 'portfolio_first' ||
         habitLoops.insight_loop?.adjustments_made > 0) &&
        metrics.days_since_last_session <= 7
    ) {
        loops.push({
            id: 'insight_loop',
            active: true,
            trigger_type: 'portfolio_activity',
            last_triggered: habitLoops.insight_loop?.last_triggered_at,
            momentum: habitLoops.insight_loop?.adjustments_made || 0
        });
    }

    // Social proof loop: triggered by community interest
    if (
        (activationState?.activation_path === 'community_first' ||
         habitLoops.social_proof_loop?.communities_joined > 0) &&
        metrics.days_since_last_session <= 7
    ) {
        loops.push({
            id: 'social_proof_loop',
            active: true,
            trigger_type: 'community_activity',
            last_triggered: habitLoops.social_proof_loop?.last_triggered_at,
            momentum: habitLoops.social_proof_loop?.communities_joined || 0
        });
    }

    return loops;
}

function calculateChurnRisk(metrics) {
    const daysSinceSession = metrics.days_since_last_session;
    const frequency = metrics.estimated_session_frequency;

    if (daysSinceSession > 14) return 'high';
    if (daysSinceSession > 10) return 'medium';
    if (daysSinceSession > 7) return 'low';
    if (frequency === 'very_low') return 'medium';
    if (frequency === 'high') return 'very_low';
    return 'low';
}

function generateRecommendations(activeLoops, metrics) {
    const recommendations = [];

    // Loop-specific recommendations
    if (activeLoops.some(l => l.id === 'discovery_loop')) {
        recommendations.push({
            loop: 'discovery_loop',
            action: 'show_deal_feed',
            priority: 1,
            reason: 'Continue deal momentum'
        });
    }

    if (activeLoops.some(l => l.id === 'insight_loop')) {
        recommendations.push({
            loop: 'insight_loop',
            action: 'show_new_insights',
            priority: 1,
            reason: 'Build portfolio confidence'
        });
    }

    if (activeLoops.some(l => l.id === 'social_proof_loop')) {
        recommendations.push({
            loop: 'social_proof_loop',
            action: 'highlight_community_activity',
            priority: 1,
            reason: 'Strengthen community engagement'
        });
    }

    // Re-engagement recommendations
    if (metrics.days_since_last_session >= 3) {
        recommendations.push({
            action: 're_engagement_trigger',
            priority: 0,
            reason: `${metrics.days_since_last_session}-day gap detected`
        });
    }

    return recommendations;
}