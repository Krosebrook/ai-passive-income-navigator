import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Determines which activation path (deal_first, portfolio_first, community_first)
 * a user should follow based on their onboarding preferences
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { onboardingProfileId } = await req.json();

        // Fetch onboarding profile
        const profile = await base44.entities.UserOnboardingProfile.read(onboardingProfileId);
        if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

        const prefs = profile.preferences || {};
        const dealSourceing = prefs.deal_sourcing || {};
        const portfolioGoals = prefs.portfolio_goals || {};
        const community = prefs.community || {};

        // Scoring system to determine path
        let dealScore = 0;
        let portfolioScore = 0;
        let communityScore = 0;

        // Deal-First Scoring
        if (dealSourceing.industries?.length >= 2) dealScore += 2;
        if (dealSourceing.ticket_size_min && dealSourceing.ticket_size_max) dealScore += 2;
        if (dealSourceing.deal_structures?.length > 0) dealScore += 1;
        if (dealSourceing.risk_tolerance === 'high') dealScore += 1;
        if (!profile.skipped_steps?.includes(1)) dealScore += 1; // Didn't skip

        // Portfolio-First Scoring
        if (portfolioGoals.annual_return_target) portfolioScore += 2;
        if (portfolioGoals.time_horizon) portfolioScore += 2;
        if (portfolioGoals.diversification_preference) portfolioScore += 1;
        if (portfolioGoals.asset_classes?.length > 0) portfolioScore += 1;
        if (!profile.skipped_steps?.includes(2)) portfolioScore += 1;

        // Community-First Scoring
        if (community.collaboration_interest === 'networking' || 
            community.collaboration_interest === 'both') communityScore += 2;
        if (community.collaboration_interest === 'learning' || 
            community.collaboration_interest === 'both') communityScore += 2;
        if (community.notification_frequency && 
            community.notification_frequency !== 'none') communityScore += 1;
        if (!profile.skipped_steps?.includes(3)) communityScore += 1;

        // Determine winning path
        const scores = {
            deal_first: dealScore,
            portfolio_first: portfolioScore,
            community_first: communityScore
        };

        const maxScore = Math.max(...Object.values(scores));
        const determinedPath = Object.entries(scores)
            .find(([_, score]) => score === maxScore)?.[0] || 'deal_first';

        // Update or create activation state
        const existingActivation = await base44.entities.ActivationState.filter({
            user_email: user.email
        });

        let activationState;
        if (existingActivation.length > 0) {
            activationState = await base44.entities.ActivationState.update(
                existingActivation[0].id,
                {
                    activation_path: determinedPath,
                    path_determined_at: new Date().toISOString()
                }
            );
        } else {
            activationState = await base44.entities.ActivationState.create({
                user_email: user.email,
                activation_path: determinedPath,
                path_determined_at: new Date().toISOString(),
                deferred_setup: {
                    portfolio_goals_skipped: profile.skipped_steps?.includes(2) || false,
                    community_preferences_skipped: profile.skipped_steps?.includes(3) || false,
                    integrations_skipped: profile.skipped_steps?.includes(5) || false
                },
                created_at: new Date().toISOString()
            });
        }

        return Response.json({
            success: true,
            path: determinedPath,
            scores,
            activationState
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});