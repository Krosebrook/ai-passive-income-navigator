import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { industries, timeframe } = await req.json();

    const trendPrompt = `
You are a market trend analyst. Provide comprehensive market analysis with actionable insights.

FOCUS INDUSTRIES: ${industries?.join(', ') || 'Technology, Healthcare, Finance, Real Estate'}
TIMEFRAME: ${timeframe || '6 months'}

Analyze:
1. Current market conditions and sentiment
2. Emerging trends and opportunities
3. Risk factors and threats
4. Competitive landscape shifts
5. Regulatory changes impact
6. Technology disruptions
7. Investment opportunities
8. Sectors to avoid
9. Optimal entry/exit timing

Provide specific, actionable insights for passive income investors.
Search current news, financial data, and expert commentary.
`;

    const trendAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: trendPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          market_overview: {
            type: 'object',
            properties: {
              overall_sentiment: { type: 'string', enum: ['bullish', 'bearish', 'neutral', 'volatile'] },
              confidence_level: { type: 'number' },
              summary: { type: 'string' }
            }
          },
          industry_analysis: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                industry: { type: 'string' },
                trend: { type: 'string', enum: ['growing', 'declining', 'stable', 'volatile'] },
                opportunity_score: { type: 'number' },
                key_drivers: { type: 'array', items: { type: 'string' } },
                risks: { type: 'array', items: { type: 'string' } },
                investment_outlook: { type: 'string' }
              }
            }
          },
          emerging_opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                opportunity: { type: 'string' },
                description: { type: 'string' },
                potential_roi: { type: 'string' },
                risk_level: { type: 'string' },
                timeframe: { type: 'string' },
                action_steps: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          sectors_to_watch: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sector: { type: 'string' },
                reason: { type: 'string' },
                catalyst: { type: 'string' }
              }
            }
          },
          sectors_to_avoid: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sector: { type: 'string' },
                reason: { type: 'string' },
                duration: { type: 'string' }
              }
            }
          },
          actionable_insights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                insight: { type: 'string' },
                action: { type: 'string' },
                priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                timeframe: { type: 'string' }
              }
            }
          },
          timing_recommendations: {
            type: 'object',
            properties: {
              buy_opportunities: { type: 'array', items: { type: 'string' } },
              sell_signals: { type: 'array', items: { type: 'string' } },
              hold_steady: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      analysis: trendAnalysis,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});