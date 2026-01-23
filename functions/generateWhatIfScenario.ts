import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scenario_type, parameters } = await req.json();

    // Get current portfolio
    const investments = await base44.entities.Investment.filter({ user_email: user.email });
    const totalValue = investments.reduce((sum, inv) => sum + (inv.current_value || inv.initial_investment), 0);

    const scenarioPrompt = `
You are a financial scenario analyst. Generate a detailed "what-if" analysis.

CURRENT PORTFOLIO:
Total Value: $${totalValue.toLocaleString()}
Investments: ${investments.length}

SCENARIO TYPE: ${scenario_type}
PARAMETERS: ${JSON.stringify(parameters, null, 2)}

Scenario Types:
- market_crash: What if market drops by X%?
- new_investment: What if I invest $X in Y industry?
- exit_investment: What if I sell investment X?
- reallocation: What if I move from X to Y asset class?
- rate_change: What if interest rates change by X%?
- goal_acceleration: What if I increase contributions by X%?

Provide:
1. Projected portfolio value after scenario
2. Impact on each investment
3. Risk level change
4. Diversification impact
5. Timeline to goals impact
6. Recommendation (proceed, modify, or avoid)
7. Alternative scenarios to consider
`;

    const scenarioAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: scenarioPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          scenario_name: {
            type: 'string'
          },
          current_state: {
            type: 'object',
            properties: {
              total_value: { type: 'number' },
              risk_level: { type: 'string' },
              diversification_score: { type: 'number' }
            }
          },
          projected_state: {
            type: 'object',
            properties: {
              total_value: { type: 'number' },
              value_change: { type: 'number' },
              value_change_percentage: { type: 'number' },
              risk_level: { type: 'string' },
              diversification_score: { type: 'number' }
            }
          },
          impact_analysis: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                factor: { type: 'string' },
                current: { type: 'string' },
                projected: { type: 'string' },
                impact: { type: 'string', enum: ['positive', 'negative', 'neutral'] }
              }
            }
          },
          recommendation: {
            type: 'object',
            properties: {
              action: { type: 'string', enum: ['proceed', 'modify', 'avoid'] },
              confidence: { type: 'number' },
              reasoning: { type: 'string' },
              considerations: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          },
          alternative_scenarios: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                potential_outcome: { type: 'string' }
              }
            }
          },
          timeline_impact: {
            type: 'object',
            properties: {
              short_term: { type: 'string' },
              medium_term: { type: 'string' },
              long_term: { type: 'string' }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      scenario: scenarioAnalysis
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});