import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deal_id } = await req.json();

    if (!deal_id) {
      return Response.json({ error: 'deal_id is required' }, { status: 400 });
    }

    // Fetch deal data
    const deal = await base44.entities.SourcedDealOpportunity.get(deal_id);
    
    // Fetch market data for context
    const marketSnapshots = await base44.asServiceRole.entities.MarketDataSnapshot.list('-snapshot_date', 30);
    
    // Fetch historical performance of similar deals
    const similarDeals = await base44.asServiceRole.entities.SourcedDealOpportunity.filter({
      industry: deal.industry,
      status: 'accepted'
    });

    // Prepare context for AI analysis
    const prompt = `
You are a financial analyst. Forecast the ROI for this investment opportunity based on historical data and market trends.

DEAL INFORMATION:
- Title: ${deal.title}
- Industry: ${deal.industry}
- Estimated Value: $${deal.estimated_value}
- Required Investment: $${deal.required_investment}
- Time to ROI: ${deal.time_to_roi}
- Risk Score: ${deal.risk_score}/10
- Deal Structure: ${deal.deal_structure}

MARKET CONTEXT:
- Recent market sentiment: ${marketSnapshots[0]?.sentiment_score || 'neutral'}
- Industry volatility: ${marketSnapshots[0]?.industry_data?.[deal.industry]?.change_percent || 'stable'}
- Market trends: ${marketSnapshots.slice(0, 5).map(s => s.sentiment_score).join(', ')}

HISTORICAL PERFORMANCE:
- Similar deals closed: ${similarDeals.length}
- Average estimated ROI in industry: ${similarDeals.reduce((acc, d) => acc + (d.estimated_roi || 0), 0) / (similarDeals.length || 1)}%

Provide a detailed ROI forecast including:
1. Conservative estimate (25th percentile)
2. Expected estimate (median)
3. Optimistic estimate (75th percentile)
4. Time-to-breakeven forecast
5. Key factors influencing the forecast
6. Confidence level (0-100%)
`;

    // Call LLM for ROI forecast
    const forecast = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          conservative_roi: { type: 'number' },
          expected_roi: { type: 'number' },
          optimistic_roi: { type: 'number' },
          breakeven_months: { type: 'number' },
          confidence_level: { type: 'number' },
          key_factors: {
            type: 'array',
            items: { type: 'string' }
          },
          market_alignment: { type: 'string' },
          forecast_summary: { type: 'string' }
        }
      }
    });

    // Update deal with forecast
    await base44.entities.SourcedDealOpportunity.update(deal_id, {
      predicted_roi: forecast.expected_roi,
      prediction_confidence: forecast.confidence_level,
      prediction_generated_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      forecast
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});