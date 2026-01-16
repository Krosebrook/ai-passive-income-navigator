import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generates AI-powered financial predictions and scaling recommendations
 * Analyzes market trends, income patterns, and provides strategic guidance
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { portfolioIdeaId, ideaTitle, ideaCategory, currentMetrics } = await req.json();

    if (!portfolioIdeaId || !ideaTitle) {
      return Response.json({ 
        error: 'Missing required fields: portfolioIdeaId, ideaTitle' 
      }, { status: 400 });
    }

    // Fetch historical financial data if available
    const historicalData = await base44.entities.FinancialData.filter({
      portfolio_idea_id: portfolioIdeaId
    });

    const prompt = `Analyze this passive income idea and generate 12-month financial predictions:

Idea: ${ideaTitle}
Category: ${ideaCategory || 'Not specified'}
Current Metrics: ${JSON.stringify(currentMetrics || {})}
Historical Data: ${historicalData.length} data points available

Based on current market trends, seasonality, and growth patterns, provide:

1. Monthly Revenue/Expense/Profit projections for next 12 months
2. Risk factors with impact assessment and mitigation strategies
3. Optimal scaling recommendations with timing
4. Market shifts that could affect revenue
5. Best/worst/most-likely case annual scenarios

Consider:
- Market saturation and competition
- Seasonal trends
- Economic conditions
- Technology changes
- Customer behavior patterns

Return JSON with structure:
{
  "monthly_projections": [
    {
      "month": 1,
      "month_name": "February 2026",
      "projected_revenue": 1000,
      "projected_expenses": 300,
      "projected_profit": 700,
      "confidence_level": "medium",
      "market_conditions": "stable growth expected"
    }
  ],
  "risk_factors": [
    {
      "factor": "Market saturation",
      "impact": "high",
      "probability": "40%",
      "mitigation": "Diversify product offerings"
    }
  ],
  "scaling_recommendations": [
    {
      "milestone": "$5K MRR",
      "when": "Month 6",
      "action": "Hire virtual assistant",
      "expected_impact": "+30% productivity"
    }
  ],
  "market_shifts": [
    {
      "shift": "AI automation trend",
      "timeframe": "Q2 2026",
      "impact_on_revenue": "+15-20%",
      "recommended_response": "Integrate AI tools early"
    }
  ],
  "best_case_annual_revenue": 50000,
  "worst_case_annual_revenue": 15000,
  "most_likely_annual_revenue": 32000
}`;

    const prediction = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          monthly_projections: { type: 'array', items: { type: 'object' } },
          risk_factors: { type: 'array', items: { type: 'object' } },
          scaling_recommendations: { type: 'array', items: { type: 'object' } },
          market_shifts: { type: 'array', items: { type: 'object' } },
          best_case_annual_revenue: { type: 'number' },
          worst_case_annual_revenue: { type: 'number' },
          most_likely_annual_revenue: { type: 'number' }
        }
      }
    });

    // Save prediction
    const savedPrediction = await base44.entities.FinancialPrediction.create({
      portfolio_idea_id: portfolioIdeaId,
      prediction_date: new Date().toISOString(),
      prediction_horizon_months: 12,
      ...prediction
    });

    return Response.json(savedPrediction);
  } catch (error) {
    console.error('Prediction error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});