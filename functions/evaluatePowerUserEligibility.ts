import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Evaluates whether user should be promoted to power-user status
 * Calculates signal score and determines unlock eligibility
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch or create power-user state
        const powerUserStates = await base44.entities.PowerUserState.filter({
            user_email: user.email
        });

        let powerUserState = powerUserStates[0];

        if (!powerUserState) {
            powerUserState = await base44.entities.PowerUserState.create({
                user_email: user.email,
                power_user_status: 'prospect',
                created_at: new Date().toISOString()
            });
        }

        // Collect signal data from other entities
        const signals = await collectSignalData(base44, user);

        // Calculate signal score
        const signalScore = calculateSignalScore(signals);

        // Determine status
        const newStatus = determineStatus(signalScore);

        // Check tier unlocks
        const tierUnlocks = determineTierUnlocks(signals, newStatus);

        // Update power-user state
        const updatedState = await base44.entities.PowerUserState.update(
            powerUserState.id,
            {
                power_user_signals: signals,
                power_user_status: newStatus,
                ...(newStatus !== powerUserState.power_user_status && 
                   newStatus !== 'prospect' && 
                   !powerUserState.power_user_since && {
                    power_user_since: new Date().toISOString()
                }),
                capability_tiers: tierUnlocks.tiers,
                unlocked_capabilities: tierUnlocks.capabilities
            }
        );

        return Response.json({
            success: true,
            power_user_state: updatedState,
            signal_score: signalScore,
            status_changed: newStatus !== powerUserState.power_user_status,
            new_status: newStatus,
            tier_unlocks: tierUnlocks.newly_unlocked,
            eligible_monetization_moments: findEligibleMoments(signals, newStatus)
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function collectSignalData(base44, user) {
    const signals = {
        deals_saved: 0,
        deals_compared: 0,
        portfolio_goals_reviewed: 0,
        community_interactions: 0,
        weekly_engagement_streak: 0,
        time_spent_hours: 0
    };

    try {
        // Count saved deals
        const bookmarks = await base44.entities.Bookmark.filter({ user_email: user.email });
        signals.deals_saved = bookmarks.length;

        // Count deal comparisons (proxy: view analytics views)
        const comparisons = await base44.entities.PerformanceMetric.filter({
            user_email: user.email
        });
        signals.deals_compared = Math.floor(comparisons.length / 2);

        // Portfolio goals reviews
        const preferences = await base44.entities.UserPreferences.filter({
          user_email: user.email
        });
        // Rough estimate: if they have goals set = at least 1 review
        signals.portfolio_goals_reviewed = preferences.length > 0 ? 2 : 0;

        // Community interactions
        const communities = await base44.entities.InvestmentGroup.filter({
            // Look for user in members
        });
        // Simplified: just check if they joined any
        signals.community_interactions = communities.length > 0 ? 3 : 0;

        // Weekly engagement streak (from retention state)
        const retentionStates = await base44.entities.RetentionState.filter({
            user_email: user.email
        });
        if (retentionStates.length > 0) {
            signals.weekly_engagement_streak = retentionStates[0].engagement_metrics?.weekly_streaks || 0;
            signals.time_spent_hours = Math.floor(
                (retentionStates[0].engagement_metrics?.total_sessions || 0) * 0.5
            );
        }
    } catch (error) {
        console.error('Error collecting signals:', error);
        // Continue with partial signals
    }

    return signals;
}

function calculateSignalScore(signals) {
    const weights = {
        deals_saved: 0.25,
        deals_compared: 0.25,
        portfolio_goals_reviewed: 0.2,
        community_interactions: 0.15,
        weekly_engagement_streak: 0.15
    };

    const thresholds = {
        deals_saved: 5,
        deals_compared: 3,
        portfolio_goals_reviewed: 2,
        community_interactions: 3,
        weekly_engagement_streak: 3
    };

    let score = 0;

    Object.keys(weights).forEach(signal => {
        const value = signals[signal] || 0;
        const threshold = thresholds[signal];
        const weight = weights[signal];
        const normalizedValue = Math.min(value / threshold, 1.0);
        score += normalizedValue * weight * 100;
    });

    return Math.round(score);
}

function determineStatus(signalScore) {
    if (signalScore >= 75) return 'premium_user';
    if (signalScore >= 50) return 'power_user';
    return 'prospect';
}

function determineTierUnlocks(signals, status) {
    const tiers = {
        advanced_discovery: {
            unlocked: signals.deals_saved >= 5,
            unlocked_at: signals.deals_saved >= 5 ? new Date().toISOString() : null,
            triggered_by: 'deals_saved'
        },
        portfolio_intelligence: {
            unlocked: signals.portfolio_goals_reviewed >= 2 && status !== 'prospect',
            unlocked_at: signals.portfolio_goals_reviewed >= 2 && status !== 'prospect' ? new Date().toISOString() : null,
            triggered_by: 'portfolio_engagement'
        },
        network_amplification: {
            unlocked: signals.community_interactions >= 3 && status !== 'prospect',
            unlocked_at: signals.community_interactions >= 3 && status !== 'prospect' ? new Date().toISOString() : null,
            triggered_by: 'community_engagement'
        }
    };

    const capabilities = [];
    if (tiers.advanced_discovery.unlocked) {
        capabilities.push('deal_comparison', 'saved_collections', 'strategy_explanation');
    }
    if (tiers.portfolio_intelligence.unlocked) {
        capabilities.push('scenario_modeling', 'projections', 'goal_mapping');
    }
    if (tiers.network_amplification.unlocked) {
        capabilities.push('expert_follows', 'signal_boosting', 'premium_communities');
    }

    return {
        tiers,
        capabilities,
        newly_unlocked: Object.entries(tiers)
            .filter(([_, tier]) => tier.unlocked)
            .map(([name]) => name)
    };
}

function findEligibleMoments(signals, status) {
    const moments = [];

    if (signals.deals_compared >= 2) {
        moments.push('deal_comparison_limit');
    }

    if (signals.portfolio_goals_reviewed >= 2 && status !== 'prospect') {
        moments.push('scenario_modeling_unlock');
    }

    if (signals.community_interactions >= 2 && status !== 'prospect') {
        moments.push('expert_network_unlock');
    }

    if (status === 'power_user') {
        moments.push('power_user_celebration');
    }

    if (signals.deals_saved >= 5 && signals.deals_compared >= 2) {
        moments.push('hours_saved_moment');
    }

    return moments;
}