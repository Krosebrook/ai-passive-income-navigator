import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI-powered onboarding insights generator
 * Provides personalized recommendations based on user responses
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { preferences, currentStep } = await req.json();

    let prompt = '';
    let response_schema = {};

    switch (currentStep) {
      case 'deal_sourcing':
        prompt = `You are an AI advisor for passive income investors. Based on this user's deal sourcing criteria:

Industries: ${preferences.target_industries?.join(', ') || 'Not specified'}
Investment Range: $${preferences.investment_size_min || 0} - $${preferences.investment_size_max || 'unlimited'}
Risk Tolerance: ${preferences.risk_tolerance || 'Not specified'}
Deal Structures: ${preferences.preferred_deal_structures?.join(', ') || 'Not specified'}

Provide:
1. A brief personalized insight (2-3 sentences) about their strategy
2. 3 specific recommendations for success
3. 1 potential concern to watch for`;

        response_schema = {
          type: 'object',
          properties: {
            insight: { type: 'string' },
            recommendations: { type: 'array', items: { type: 'string' } },
            concern: { type: 'string' }
          }
        };
        break;

      case 'portfolio_goals':
        prompt = `Based on this investor profile:

Time Horizon: ${preferences.time_horizon || 'Not specified'}
Target Return: ${preferences.target_return_percentage || 'Not specified'}%
Diversification: ${preferences.diversification_preference || 'Not specified'}
Risk Tolerance: ${preferences.risk_tolerance || 'Not specified'}

Provide:
1. A personalized portfolio strategy insight (2-3 sentences)
2. 3 specific asset allocation suggestions
3. Expected timeframe to reach goals`;

        response_schema = {
          type: 'object',
          properties: {
            strategy_insight: { type: 'string' },
            allocation_suggestions: { type: 'array', items: { type: 'string' } },
            expected_timeframe: { type: 'string' }
          }
        };
        break;

      case 'summary':
        prompt = `Create a comprehensive onboarding summary for this investor:

${JSON.stringify(preferences, null, 2)}

Provide:
1. A personalized welcome message highlighting their unique investment profile
2. Top 3 recommended next steps
3. Suggested first action in the platform`;

        response_schema = {
          type: 'object',
          properties: {
            welcome_message: { type: 'string' },
            next_steps: { type: 'array', items: { type: 'string' } },
            first_action: { type: 'string' }
          }
        };
        break;
    }

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: response_schema
    });

    return Response.json({
      success: true,
      insights: aiResponse
    });

  } catch (error) {
    console.error('Onboarding insights error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});