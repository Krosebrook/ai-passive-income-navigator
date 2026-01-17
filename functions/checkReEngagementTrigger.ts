import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Evaluates inactivity and generates value-first re-engagement messages
 * Called by background job when user hasn't engaged
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
            return Response.json({ result: 'no_state' });
        }

        const retentionState = retentionStates[0];
        const reEngagement = retentionState.re_engagement || {};
        const lastSession = retentionState.engagement_metrics?.last_session_at;

        if (!lastSession) {
            return Response.json({ result: 'no_prior_activity' });
        }

        // Calculate inactivity
        const daysInactive = Math.floor(
            (Date.now() - new Date(lastSession).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Check cooldown
        if (reEngagement.re_engagement_cooldown_until) {
            const now = new Date();
            const cooldownUntil = new Date(reEngagement.re_engagement_cooldown_until);
            if (now < cooldownUntil) {
                return Response.json({
                    result: 'in_cooldown',
                    cooldown_until: reEngagement.re_engagement_cooldown_until
                });
            }
        }

        // Check if re-engagement should trigger
        const trigger = selectReEngagementTrigger(daysInactive, reEngagement);

        if (!trigger) {
            return Response.json({ result: 'no_trigger_yet' });
        }

        // Generate value-first message
        const message = await buildReEngagementMessage(base44, trigger, retentionState);

        // Update re-engagement state
        const newCooldownUntil = new Date(
            Date.now() + (trigger.cooldown_hours * 60 * 60 * 1000)
        ).toISOString();

        await base44.entities.RetentionState.update(retentionState.id, {
            re_engagement: {
                ...reEngagement,
                inactivity_streak_days: daysInactive,
                re_engagement_attempts: (reEngagement.re_engagement_attempts || 0) + 1,
                last_re_engagement_at: new Date().toISOString(),
                re_engagement_cooldown_until: newCooldownUntil,
                triggered_by: trigger.id
            }
        });

        return Response.json({
            success: true,
            re_engagement_triggered: true,
            message,
            trigger_id: trigger.id,
            days_inactive: daysInactive
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function selectReEngagementTrigger(daysInactive, reEngagement) {
    const attempts = reEngagement.re_engagement_attempts || 0;

    // Max attempts check
    if (attempts >= 4) return null;

    // Day 3 trigger
    if (daysInactive === 3 && attempts === 0) {
        return {
            id: 'day3_silent',
            days_inactive: 3,
            strategy: 'value_first',
            cooldown_hours: 72
        };
    }

    // Day 7 trigger
    if (daysInactive === 7 && attempts === 1) {
        return {
            id: 'day7_missed_deals',
            days_inactive: 7,
            strategy: 'opportunity_highlight',
            cooldown_hours: 168
        };
    }

    // Day 14 trigger
    if (daysInactive === 14 && attempts === 2) {
        return {
            id: 'day14_insight',
            days_inactive: 14,
            strategy: 'fresh_perspective',
            cooldown_hours: 336
        };
    }

    // Day 21 trigger
    if (daysInactive === 21 && attempts === 3) {
        return {
            id: 'day21_community',
            days_inactive: 21,
            strategy: 'peer_activity',
            cooldown_hours: 504
        };
    }

    return null;
}

async function buildReEngagementMessage(base44, trigger, retentionState) {
    let subject, preview, body;

    switch (trigger.id) {
        case 'day3_silent':
            subject = '3 new deals match your criteria';
            preview = 'Browse personalized opportunities from the last 3 days';
            body = 'Your preferences matched 3 new deals. Here\'s what\'s relevant to you.';
            break;

        case 'day7_missed_deals':
            subject = '7 deals moved this week — want the highlights?';
            preview = 'Quick summary of this week\'s best matches';
            body = 'The deal market moved while you were away. Here are this week\'s best matches for your profile.';
            break;

        case 'day14_insight':
            subject = 'Your portfolio setup unlocks new insights';
            preview = 'See what\'s changed in your personalized view';
            body = 'Setting goals earlier unlocks smarter recommendations. See what\'s available now.';
            break;

        case 'day21_community':
            subject = 'Your community is discussing {topic}. Catch up?';
            preview = 'New conversations in your network';
            body = 'People you follow are sharing insights about deals in your focus areas.';
            break;

        default:
            subject = 'Fresh opportunities await you';
            preview = 'Personalized to your profile';
            body = 'New deals and insights are ready for you.';
    }

    return {
        subject,
        preview,
        body,
        cta: 'Catch Up',
        cta_url: '/home',
        personalization_reference: 'Based on your profile',
        avoid_guilt: true
    };
}