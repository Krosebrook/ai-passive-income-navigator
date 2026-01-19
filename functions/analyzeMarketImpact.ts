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
    const deals = await base44.entities.DealPipeline.filter({ id: dealId });
    if (deals.length === 0) {
      return Response.json({ error: 'Deal not found' }, { status: 404 });
    }

    const deal = deals[0];

    // Get latest market data
    const marketSnapshots = await base44.entities.MarketDataSnapshot.list('-snapshot_date', 1);
    if (marketSnapshots.length === 0) {
      return Response.json({ error: 'No market data available' }, { status: 404 });
    }

    const marketData = marketSnapshots[0];

    // Analyze market impact on deal using AI
    const analysisPrompt = `
You are a financial analyst. Analyze how current market conditions impact this investment deal:

Deal Details:
- Name: ${deal.deal_name}
- Description: ${deal.deal_description || 'N/A'}
- Industry: ${deal.industry || 'General'}
- Stage: ${deal.stage}
- Estimated Value: $${deal.estimated_value || 0}
- Expected Close: ${deal.expected_close_date || 'Not specified'}

Current Market Conditions:
- Market Sentiment: ${marketData.sentiment_score > 0 ? 'Bullish' : marketData.sentiment_score < 0 ? 'Bearish' : 'Neutral'} (${marketData.sentiment_score})
- VIX (Volatility): ${marketData.market_indices?.vix || 'N/A'}
- S&P 500: ${marketData.market_indices?.sp500 || 'N/A'}

Provide:
1. Risk Assessment: How do current market conditions affect this deal's risk profile?
2. Opportunity Score: Rate the opportunity timing (0-100)
3. Key Market Factors: What market trends are most relevant?
4. Recommendations: Should the user proceed, wait, or reconsider?
5. Optimal Timing: When might be the best time to close this deal?
`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          risk_assessment: {
            type: "object",
            properties: {
              level: { type: "string", enum: ["low", "medium", "high", "critical"] },
              score: { type: "number" },
              explanation: { type: "string" },
              market_factors: {
                type: "array",
                items: { type: "string" }
              }
            }
          },
          opportunity_score: { type: "number" },
          key_market_factors: {
            type: "array",
            items: { type: "string" }
          },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                rationale: { type: "string" },
                priority: { type: "string", enum: ["high", "medium", "low"] }
              }
            }
          },
          optimal_timing: {
            type: "object",
            properties: {
              timeframe: { type: "string" },
              reasoning: { type: "string" }
            }
          },
          adjusted_roi_projection: { type: "number" }
        }
      }
    });

    // Update deal with market-adjusted projections
    await base44.entities.DealPipeline.update(dealId, {
      notes: `${deal.notes || ''}\n\n[Market Analysis ${new Date().toLocaleDateString()}]\nRisk: ${analysis.risk_assessment.level} | Opportunity: ${analysis.opportunity_score}/100`
    });

    return Response.json({
      success: true,
      analysis,
      marketConditions: {
        sentiment: marketData.sentiment_score,
        volatility: marketData.volatility_index
      }
    });

  } catch (error) {
    console.error('Market impact analysis error:', error);
    return Response.json({ 
      error: error.message || 'Failed to analyze market impact' 
    }, { status: 500 });
  }
});