import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's investments
    const investments = await base44.entities.Investment.filter({ user_email: user.email });
    
    // Fetch user preferences
    const userPrefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
    const prefs = userPrefs[0] || {};

    // Fetch market data
    const marketData = await base44.asServiceRole.entities.MarketDataSnapshot.list('-snapshot_date', 1);

    // Calculate current allocation
    const totalValue = investments.reduce((sum, inv) => sum + (inv.current_value || inv.initial_investment), 0);
    const allocationByIndustry = {};
    const allocationByAssetType = {};

    investments.forEach(inv => {
      const value = inv.current_value || inv.initial_investment;
      const industryPct = (value / totalValue) * 100;
      const assetPct = (value / totalValue) * 100;

      allocationByIndustry[inv.industry] = (allocationByIndustry[inv.industry] || 0) + industryPct;
      allocationByAssetType[inv.asset_type] = (allocationByAssetType[inv.asset_type] || 0) + assetPct;
    });

    const prompt = `
You are a portfolio management advisor. Analyze this investment portfolio and provide rebalancing recommendations.

CURRENT PORTFOLIO:
- Total Value: $${totalValue}
- Number of Investments: ${investments.length}
- Industry Allocation: ${JSON.stringify(allocationByIndustry)}
- Asset Type Allocation: ${JSON.stringify(allocationByAssetType)}

INDIVIDUAL INVESTMENTS:
${investments.map(inv => `
  - ${inv.investment_name}: $${inv.current_value || inv.initial_investment} (${inv.industry}, ${inv.asset_type})
    ROI: ${inv.actual_roi || 0}%, Status: ${inv.status}
`).join('\n')}

USER PROFILE:
- Risk Tolerance: ${prefs.risk_tolerance || 'moderate'}
- Target Return: ${prefs.target_return_percentage || 15}%
- Diversification Preference: ${prefs.diversification_preference || 'moderately_diversified'}
- Time Horizon: ${prefs.time_horizon || 'medium_term'}

MARKET CONDITIONS:
- Overall Sentiment: ${marketData[0]?.sentiment_score || 'neutral'}
- Volatility Index: ${marketData[0]?.volatility_index || 'moderate'}

Provide personalized rebalancing recommendations including:
1. Overall portfolio health assessment
2. Specific rebalancing actions (buy, sell, hold with amounts)
3. Target allocation by industry and asset type
4. Rationale for each recommendation
5. Risk-adjusted return optimization
6. Timeline for implementing changes
`;

    const recommendations = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          portfolio_health_score: { type: 'number' },
          health_assessment: { type: 'string' },
          rebalancing_actions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                action: { type: 'string' },
                investment_name: { type: 'string' },
                amount: { type: 'number' },
                rationale: { type: 'string' },
                priority: { type: 'string' }
              }
            }
          },
          target_allocation: {
            type: 'object',
            properties: {
              by_industry: { type: 'object' },
              by_asset_type: { type: 'object' }
            }
          },
          expected_improvements: {
            type: 'object',
            properties: {
              risk_reduction: { type: 'string' },
              return_potential: { type: 'string' },
              diversification: { type: 'string' }
            }
          },
          implementation_timeline: { type: 'string' },
          key_considerations: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    // Store recommendations
    await base44.entities.PortfolioAdjustmentSuggestion.create({
      overall_assessment: recommendations.health_assessment,
      recommendations: recommendations.rebalancing_actions,
      target_allocation: recommendations.target_allocation,
      status: 'pending',
      generated_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      recommendations
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});