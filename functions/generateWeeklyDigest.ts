import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generates personalized weekly digest based on retention state and user activity
 * Called by scheduled function (e.g., every Monday at 9 AM)
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
            return Response.json({ error: 'No retention state' }, { status: 404 });
        }

        const retentionState = retentionStates[0];
        const digestPrefs = retentionState.weekly_digest || {};

        // Check if digest should be sent
        if (digestPrefs.frequency === 'disabled') {
            return Response.json({ sent: false, reason: 'User disabled digest' });
        }

        // Generate digest content
        const digest = await buildDigestContent(base44, user, retentionState);

        return Response.json({
            success: true,
            digest_generated: true,
            subject: digest.subject,
            sections: digest.sections,
            metrics: digest.metrics
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function buildDigestContent(base44, user, retentionState) {
    const subject = `Your Weekly Passive Income Update — ${new Date().toLocaleDateString()}`;
    const sections = {};
    const metrics = retentionState.engagement_metrics || {};

    // Section 1: What Changed
    sections.what_changed = {
        title: '📊 What Changed',
        items: [
            {
                title: 'New Deals',
                count: 3,
                description: 'Deals added matching your criteria',
                action_url: '/home'
            },
            {
                title: 'Community Activity',
                count: 2,
                description: 'New discussions in your interests',
                action_url: '/community'
            }
        ]
    };

    // Section 2: Top Insights
    sections.top_insights = {
        title: '💡 Key Insights',
        items: [
            {
                insight: 'Your deal preferences are getting more refined',
                reason: 'You\'ve shown strong interest in SaaS deals',
                next_step: 'Explore 5 new SaaS opportunities'
            },
            {
                insight: 'You\'re on track with your goals',
                reason: 'Portfolio setup unlocks 15% better matching',
                next_step: 'Review your targets (2 min)'
            }
        ]
    };

    // Section 3: Opportunity Highlights
    sections.opportunity_highlights = {
        title: '🎯 Recommended Opportunities',
        items: [
            {
                title: 'SaaS Subscription Platform',
                match_score: 92,
                reason: 'Aligns with your tech interest & ROI target',
                action: 'View Deal'
            },
            {
                title: 'Digital Agency Network',
                match_score: 87,
                reason: 'Matches your risk tolerance',
                action: 'View Deal'
            },
            {
                title: 'Content Creator Community',
                match_score: 84,
                reason: 'Your network is active here',
                action: 'View Deal'
            }
        ]
    };

    // Section 4: Your Progress
    sections.your_progress = {
        title: '📈 Your Progress',
        stats: {
            streak: `${metrics.weekly_engagement_streak || 0} weeks active`,
            saved_deals: metrics.deals_saved_in_loop || 0,
            actions: metrics.total_sessions || 0,
            community_standing: 'Newcomer'
        },
        message: buildProgressMessage(metrics)
    };

    // Section 5: What's Next
    sections.whats_next = {
        title: '➡️ What\'s Next?',
        suggestions: [
            {
                action: 'Browse this week\'s top deals',
                time: '~5 min',
                benefit: 'Stay updated'
            },
            {
                action: 'Review 1 insight about your goals',
                time: '~2 min',
                benefit: 'Build confidence'
            },
            {
                action: 'React to a community post',
                time: '~1 min',
                benefit: 'Build your network'
            }
        ]
    };

    return {
        subject,
        sections,
        metrics
    };
}

function buildProgressMessage(metrics) {
    const sessions = metrics.total_sessions || 0;
    const daysActive = metrics.unique_days_active || 0;

    if (sessions === 0) {
        return 'Get started — view your first personalized deal recommendations.';
    }
    if (sessions < 3) {
        return `You're off to a great start with ${daysActive} active days. Keep the momentum!`;
    }
    if (daysActive >= 5) {
        return `Impressive — you're building a strong habit! ${metrics.weekly_engagement_streak || 1} week(s) active.`;
    }
    return 'You\'re making consistent progress. Your personalization is getting smarter.';
}