import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Evaluates user's progress toward activation milestones
 * Returns completed milestones and next recommended actions
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch activation state
        const activationStates = await base44.entities.ActivationState.filter({
            user_email: user.email
        });

        if (activationStates.length === 0) {
            return Response.json({
                activated: false,
                milestones: {},
                nextActions: ['complete_onboarding']
            });
        }

        const activationState = activationStates[0];
        const milestones = activationState.milestones || {};

        // Count completed primary milestones
        const completedMilestones = Object.entries(milestones)
            .filter(([_, m]) => m.completed)
            .map(([key]) => key);

        // Check if user is activated (reached FMV)
        const isActivated = completedMilestones.length > 0;

        // Update activation status if needed
        if (isActivated && !activationState.activated) {
            await base44.entities.ActivationState.update(activationState.id, {
                activated: true,
                activated_at: new Date().toISOString()
            });
        }

        // Calculate time since onboarding
        const onboardingProfile = await base44.entities.UserOnboardingProfile.filter({
            user_email: user.email
        });

        const startDate = new Date(onboardingProfile[0]?.started_at || Date.now());
        const daysSinceOnboarding = Math.floor(
            (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Get inactivity
        const lastMilestoneTime = Math.max(
            ...completedMilestones.map(m => 
                new Date(milestones[m]?.completed_at || 0).getTime()
            ),
            0
        );

        const daysSinceLastMilestone = lastMilestoneTime > 0
            ? Math.floor((Date.now() - lastMilestoneTime) / (1000 * 60 * 60 * 24))
            : daysSinceOnboarding;

        return Response.json({
            success: true,
            activated: isActivated,
            activation_path: activationState.activation_path,
            completed_milestones: completedMilestones,
            days_since_onboarding: daysSinceOnboarding,
            days_since_last_milestone: daysSinceLastMilestone,
            milestones_detail: milestones,
            is_inactive: daysSinceLastMilestone > 3,
            window_closing: daysSinceOnboarding > 10 && !isActivated,
            recommendations: generateRecommendations(
                activationState.activation_path,
                completedMilestones,
                daysSinceOnboarding,
                milestones
            )
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function generateRecommendations(path, completedMilestones, daysSinceOnboarding, milestones) {
    const recommendations = [];

    // Path-specific recommendations
    if (path === 'deal_first') {
        if (!completedMilestones.includes('first_deal_viewed')) {
            recommendations.push({
                action: 'view_personalized_deals',
                priority: 1,
                reason: 'Browse AI-matched deals'
            });
        } else if (!completedMilestones.includes('first_deal_saved')) {
            recommendations.push({
                action: 'save_deal',
                priority: 1,
                reason: 'Bookmark interesting deals'
            });
        }
    }

    if (path === 'portfolio_first') {
        if (!completedMilestones.includes('portfolio_goal_configured')) {
            recommendations.push({
                action: 'configure_portfolio_goals',
                priority: 1,
                reason: 'Set financial targets'
            });
        } else if (!completedMilestones.includes('first_deal_viewed')) {
            recommendations.push({
                action: 'view_aligned_deals',
                priority: 2,
                reason: 'Explore deals matching your goals'
            });
        }
    }

    if (path === 'community_first') {
        if (!completedMilestones.includes('community_interaction')) {
            recommendations.push({
                action: 'discover_communities',
                priority: 1,
                reason: 'Join groups or follow experts'
            });
        }
    }

    // Urgency-based recommendations
    if (daysSinceOnboarding > 10 && completedMilestones.length === 0) {
        recommendations.unshift({
            action: 'urgent_re_engagement',
            priority: 0,
            reason: 'Help user achieve FMV before day 14'
        });
    }

    if (daysSinceOnboarding > 3 && completedMilestones.length === 0) {
        recommendations.unshift({
            action: 'gentle_nudge',
            priority: 0,
            reason: 'Low engagement in first week'
        });
    }

    return recommendations;
}