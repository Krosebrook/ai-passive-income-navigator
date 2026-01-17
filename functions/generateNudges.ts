import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { userId, profile } = await req.json();
        if (!profile) return Response.json({ error: 'Profile required' }, { status: 400 });

        // Evaluate nudge conditions
        const applicableNudges = [];
        const daysSinceOnboarding = Math.floor(
            (Date.now() - new Date(profile.started_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Nudge 1: High Risk Deals
        if (
            profile.preferences?.deal_sourcing?.risk_tolerance === 'high' &&
            daysSinceOnboarding < 7
        ) {
            applicableNudges.push({
                id: 'high_risk_deals',
                message: '🎯 You set a high-risk tolerance. Want to explore these emerging opportunities?',
                actionLabel: 'Show me deals',
                targetPage: 'Home',
                priority: 3
            });
        }

        // Nudge 2: Incomplete Portfolio Goals
        const skippedSteps = profile.skipped_steps || [];
        const savedDeals = 0; // Would query actual saved deals

        if (skippedSteps.includes(2) && savedDeals > 0) {
            applicableNudges.push({
                id: 'incomplete_portfolio_goals',
                message: '📊 Setting portfolio goals improves AI recommendations. Take 2 minutes?',
                actionLabel: 'Complete setup',
                targetPage: 'ProfileSettings',
                priority: 2
            });
        }

        // Nudge 3: Community Matching
        if (skippedSteps.includes(3)) {
            applicableNudges.push({
                id: 'community_matching',
                message: '👥 Users like you often join our investment groups. Check them out?',
                actionLabel: 'View groups',
                targetPage: 'Community',
                priority: 2
            });
        }

        // Nudge 4: Re-engagement
        if (profile.activation_metrics) {
            const lastActivity = profile.activation_metrics.first_deal_viewed_at ||
                                 profile.activation_metrics.first_portfolio_idea_added_at;
            
            if (lastActivity) {
                const daysSinceActivity = Math.floor(
                    (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
                );

                if (daysSinceActivity > 7) {
                    applicableNudges.push({
                        id: 'inactive_user',
                        message: '🆕 New deals matching your interests just dropped!',
                        actionLabel: 'Browse deals',
                        targetPage: 'Home',
                        priority: 1
                    });
                }
            }
        }

        // Store nudges
        const existingNudges = profile.nudges?.shown_nudges || [];
        const newNudges = applicableNudges.filter(n => !existingNudges.includes(n.id));

        if (newNudges.length > 0) {
            await base44.entities.UserOnboardingProfile.update(profile.id, {
                nudges: {
                    ...profile.nudges,
                    shown_nudges: [...existingNudges, ...newNudges.map(n => n.id)]
                }
            });
        }

        // Sort by priority
        newNudges.sort((a, b) => b.priority - a.priority);

        return Response.json({
            success: true,
            nudges: newNudges.slice(0, 2) // Return top 2 nudges
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});