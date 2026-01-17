import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Triggers appropriate habit loop based on user action and retention state
 * Updates retention state and returns loop content
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { trigger_action, metadata } = await req.json();

        // Fetch retention state
        const retentionStates = await base44.entities.RetentionState.filter({
            user_email: user.email
        });

        if (retentionStates.length === 0) {
            return Response.json({ error: 'No retention state found' }, { status: 404 });
        }

        const retentionState = retentionStates[0];
        const habitLoops = retentionState.habit_loops || {};

        let triggeredLoop = null;

        // Determine which loop to trigger based on action
        if (
            trigger_action === 'deal_saved' ||
            trigger_action === 'deal_viewed'
        ) {
            triggeredLoop = await triggerDiscoveryLoop(
                retentionState,
                habitLoops,
                trigger_action,
                metadata
            );
        } else if (
            trigger_action === 'analytics_viewed' ||
            trigger_action === 'goal_adjusted'
        ) {
            triggeredLoop = await triggerInsightLoop(
                retentionState,
                habitLoops,
                trigger_action,
                metadata
            );
        } else if (
            trigger_action === 'community_viewed' ||
            trigger_action === 'expert_followed'
        ) {
            triggeredLoop = await triggerSocialProofLoop(
                retentionState,
                habitLoops,
                trigger_action,
                metadata
            );
        }

        if (!triggeredLoop) {
            return Response.json({
                triggered: false,
                reason: 'Loop already triggered recently'
            });
        }

        // Update retention state
        await base44.entities.RetentionState.update(retentionState.id, {
            habit_loops: habitLoops,
            active_habit_loops: Object.keys(habitLoops)
                .filter(key => habitLoops[key].enabled)
                .map(key => key.replace('_loop', ''))
        });

        return Response.json({
            success: true,
            triggered_loop: triggeredLoop
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function triggerDiscoveryLoop(retentionState, habitLoops, action, metadata) {
    const loop = habitLoops.discovery_loop || {
        enabled: false,
        trigger_count: 0,
        completed_actions: 0,
        last_triggered_at: null,
        deals_viewed_in_loop: 0,
        deals_saved_in_loop: 0
    };

    // Check cooldown
    if (loop.last_triggered_at) {
        const hoursSinceTrigger = (Date.now() - new Date(loop.last_triggered_at).getTime()) / (1000 * 60 * 60);
        if (hoursSinceTrigger < 24) return null;
    }

    loop.enabled = true;
    loop.trigger_count += 1;
    loop.last_triggered_at = new Date().toISOString();

    if (action === 'deal_saved') {
        loop.deals_saved_in_loop += 1;
        loop.completed_actions += 1;
    } else if (action === 'deal_viewed') {
        loop.deals_viewed_in_loop += 1;
    }

    habitLoops.discovery_loop = loop;

    return {
        loop_id: 'discovery_loop',
        message: 'Your deal feed just got smarter — {count} new matches added',
        steps: [
            { step: 1, action: 'show_personalized_deals', message: '3 new deals match your criteria' },
            { step: 2, action: 'show_match_explanation', message: 'Here\'s why these fit your profile' },
            { step: 3, action: 'encourage_save', message: 'Save deals you\'d research further' }
        ],
        personalization_boost: 0.1,
        surface: 'card_in_feed'
    };
}

async function triggerInsightLoop(retentionState, habitLoops, action, metadata) {
    const loop = habitLoops.insight_loop || {
        enabled: false,
        trigger_count: 0,
        completed_actions: 0,
        last_triggered_at: null,
        adjustments_made: 0
    };

    // Check cooldown
    if (loop.last_triggered_at) {
        const hoursSinceTrigger = (Date.now() - new Date(loop.last_triggered_at).getTime()) / (1000 * 60 * 60);
        if (hoursSinceTrigger < 48) return null;
    }

    loop.enabled = true;
    loop.trigger_count += 1;
    loop.last_triggered_at = new Date().toISOString();

    if (action === 'goal_adjusted') {
        loop.adjustments_made += 1;
        loop.completed_actions += 1;
    }

    habitLoops.insight_loop = loop;

    return {
        loop_id: 'insight_loop',
        message: 'You\'re on track — {metric} shows {direction} momentum',
        steps: [
            { step: 1, action: 'show_insights', message: '2 new insights about your portfolio' },
            { step: 2, action: 'show_aligned_deals', message: 'Here are deals aligned to your targets' },
            { step: 3, action: 'invite_adjustment', message: 'Small updates can improve your strategy' }
        ],
        personalization_boost: 0.15,
        surface: 'side_panel'
    };
}

async function triggerSocialProofLoop(retentionState, habitLoops, action, metadata) {
    const loop = habitLoops.social_proof_loop || {
        enabled: false,
        trigger_count: 0,
        completed_actions: 0,
        last_triggered_at: null,
        communities_viewed: 0,
        communities_joined: 0
    };

    // Check cooldown
    if (loop.last_triggered_at) {
        const hoursSinceTrigger = (Date.now() - new Date(loop.last_triggered_at).getTime()) / (1000 * 60 * 60);
        if (hoursSinceTrigger < 48) return null;
    }

    loop.enabled = true;
    loop.trigger_count += 1;
    loop.last_triggered_at = new Date().toISOString();

    if (action === 'community_viewed') {
        loop.communities_viewed += 1;
    } else if (action === 'expert_followed') {
        loop.communities_joined += 1;
        loop.completed_actions += 1;
    }

    habitLoops.social_proof_loop = loop;

    return {
        loop_id: 'social_proof_loop',
        message: 'Your network now sees your interests — {count} new connections',
        steps: [
            { step: 1, action: 'highlight_discussions', message: 'High-value discussions in your areas' },
            { step: 2, action: 'recommend_experts', message: 'People working on similar deals' },
            { step: 3, action: 'encourage_engagement', message: 'React to insights — no pressure to post' }
        ],
        personalization_boost: 0.1,
        surface: 'community_panel'
    };
}