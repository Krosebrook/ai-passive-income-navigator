import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Post-onboarding AI-driven nudge generator
 * Creates personalized feature discovery prompts
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user preferences and activity
    const [preferences, portfolio, deals] = await Promise.all([
      base44.entities.UserPreferences.filter({ created_by: user.email }),
      base44.entities.PortfolioIdea.filter({ created_by: user.email }),
      base44.entities.SourcedDealOpportunity.filter({ created_by: user.email })
    ]);

    const userPref = preferences[0] || {};

    const prompt = `Generate 3-5 personalized onboarding nudges for this user:

USER PROFILE:
${JSON.stringify(userPref, null, 2)}

ACTIVITY:
- Portfolio Items: ${portfolio.length}
- Sourced Deals: ${deals.length}

For each nudge, provide:
1. Nudge type (feature_discovery, completion_prompt, learning_resource, community_intro, first_action)
2. Target feature (e.g., "deal_sourcing", "collaboration", "financial_analysis")
3. Engaging title (short, action-oriented)
4. Message (1-2 sentences, friendly tone)
5. Action label (button text, e.g., "Discover Deals")
6. Priority (1-10, higher = more important)

Focus on features they haven't explored yet but would benefit from based on their profile.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          nudges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                nudge_type: { type: 'string' },
                target_feature: { type: 'string' },
                title: { type: 'string' },
                message: { type: 'string' },
                action_label: { type: 'string' },
                priority: { type: 'number' }
              }
            }
          }
        }
      }
    });

    // Create nudges in database
    const createdNudges = [];
    for (const nudge of response.nudges || []) {
      const created = await base44.entities.OnboardingNudge.create(nudge);
      createdNudges.push(created);
    }

    return Response.json({
      success: true,
      nudges: createdNudges
    });

  } catch (error) {
    console.error('Nudge generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});