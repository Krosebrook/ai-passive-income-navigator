import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { industries, user_preferences } = await req.json();

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

    // Multi-source market data query
    const query = `Identify arbitrage and mispricing opportunities in: ${industries?.join(', ')}. 
    
Look for:
- Price discrepancies across platforms/markets
- Undervalued assets based on fundamentals
- Market inefficiencies and gaps
- Emerging trends before mainstream adoption
- Geographic pricing differences
- Supply-demand imbalances

Provide specific, actionable opportunities with data.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are an arbitrage specialist and market inefficiency detector. Identify specific opportunities with concrete data and execution paths.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        max_tokens: 2500
      })
    });

    const data = await response.json();
    const rawOpportunities = data.choices[0].message.content;

    // Structure and score opportunities
    const structured = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze these arbitrage opportunities and structure them:

${rawOpportunities}

For each opportunity provide:
1. Type (price_arbitrage, market_inefficiency, trend_early_entry, geographic_spread, supply_demand_gap)
2. Description
3. Opportunity score (0-100)
4. Confidence level (0-100)
5. Expected return (percentage range)
6. Risk level (low, medium, high)
7. Execution complexity (simple, moderate, complex)
8. Time horizon (immediate, short-term, medium-term, long-term)
9. Capital requirement (bootstrapped, medium, high)
10. Entry strategy (step by step)
11. Exit criteria
12. Risk mitigation steps

Return JSON with opportunities array.`,
      response_json_schema: {
        type: 'object',
        properties: {
          opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                type: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                opportunity_score: { type: 'number' },
                confidence: { type: 'number' },
                expected_return: { type: 'string' },
                risk_level: { type: 'string' },
                execution_complexity: { type: 'string' },
                time_horizon: { type: 'string' },
                capital_requirement: { type: 'string' },
                entry_strategy: {
                  type: 'array',
                  items: { type: 'string' }
                },
                exit_criteria: {
                  type: 'array',
                  items: { type: 'string' }
                },
                risk_mitigation: {
                  type: 'array',
                  items: { type: 'string' }
                },
                data_sources: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          },
          market_context: { type: 'string' },
          timestamp: { type: 'string' }
        }
      }
    });

    // Rank by user preferences
    const ranked = structured.opportunities
      .sort((a, b) => b.opportunity_score - a.opportunity_score)
      .slice(0, 10);

    return Response.json({
      total_found: structured.opportunities.length,
      top_opportunities: ranked,
      market_context: structured.market_context,
      raw_intel: rawOpportunities,
      sources: data.citations || [],
      analyzed_at: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});