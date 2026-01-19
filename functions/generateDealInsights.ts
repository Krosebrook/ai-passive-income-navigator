import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dealId } = await req.json();

    // Get deal details
    const [deals, allDeals, marketData] = await Promise.all([
      base44.entities.DealPipeline.filter({ id: dealId }),
      base44.entities.DealPipeline.list(),
      base44.entities.MarketDataSnapshot.list('-snapshot_date', 1)
    ]);

    if (deals.length === 0) {
      return Response.json({ error: 'Deal not found' }, { status: 404 });
    }

    const deal = deals[0];
    const historicalDeals = allDeals.filter(d => d.stage === 'completed' || d.stage === 'archived');

    // Prepare context for AI analysis
    const analysisPrompt = `
You are an expert investment analyst. Analyze this deal and provide comprehensive insights:

TARGET DEAL:
- Name: ${deal.deal_name}
- Description: ${deal.deal_description || 'N/A'}
- Stage: ${deal.stage}
- Estimated Value: $${deal.estimated_value || 0}
- Priority: ${deal.priority}
- Expected Close: ${deal.expected_close_date || 'Not set'}
- Progress: ${deal.progress_percentage || 0}%

HISTORICAL CONTEXT:
- Total completed deals: ${historicalDeals.length}
- Average deal value: $${historicalDeals.length > 0 ? Math.round(historicalDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0) / historicalDeals.length) : 0}

MARKET CONDITIONS:
- Market Sentiment: ${marketData[0]?.sentiment_score || 'Unknown'}
- Volatility: ${marketData[0]?.volatility_index || 'Unknown'}

Provide:

1. SUCCESS PROBABILITY (0-100):
   - Score based on deal attributes, stage, market conditions, and historical patterns
   - Key factors influencing success
   - Confidence level in prediction

2. NEGOTIATION STRATEGIES:
   - 3-5 specific tactics for current stage (${deal.stage})
   - Timing recommendations
   - Leverage points
   - Red lines and walk-away conditions

3. RISK ANALYSIS:
   - Top 5 potential risks (categorized by likelihood and impact)
   - Early warning signs to monitor
   - Concrete mitigation steps for each risk

4. ACTION ITEMS:
   - Immediate next steps prioritized by impact
   - Timeline for each action

Base your analysis on real investment principles, negotiation theory, and market dynamics.
`;

    const insights = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          success_probability: {
            type: "object",
            properties: {
              score: { type: "number" },
              confidence: { type: "string", enum: ["low", "medium", "high"] },
              key_factors: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    factor: { type: "string" },
                    impact: { type: "string", enum: ["positive", "negative", "neutral"] },
                    weight: { type: "number" }
                  }
                }
              }
            }
          },
          negotiation_strategies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                strategy: { type: "string" },
                description: { type: "string" },
                timing: { type: "string" },
                expected_outcome: { type: "string" }
              }
            }
          },
          risk_analysis: {
            type: "array",
            items: {
              type: "object",
              properties: {
                risk: { type: "string" },
                likelihood: { type: "string", enum: ["low", "medium", "high"] },
                impact: { type: "string", enum: ["low", "medium", "high", "critical"] },
                warning_signs: {
                  type: "array",
                  items: { type: "string" }
                },
                mitigation_steps: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          action_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                timeline: { type: "string" },
                expected_impact: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      insights,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Deal insights generation error:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate deal insights' 
    }, { status: 500 });
  }
});