import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's investments
    const investments = await base44.entities.Investment.filter({ user_email: user.email });
    
    if (investments.length === 0) {
      return Response.json({ 
        risks: [],
        message: 'No investments found to analyze'
      });
    }

    // Calculate portfolio metrics
    const totalValue = investments.reduce((sum, inv) => sum + (inv.current_value || inv.initial_investment), 0);
    const industryConcentration = {};
    const assetTypeConcentration = {};
    
    investments.forEach(inv => {
      const value = inv.current_value || inv.initial_investment;
      const percentage = (value / totalValue) * 100;
      
      if (!industryConcentration[inv.industry]) {
        industryConcentration[inv.industry] = 0;
      }
      industryConcentration[inv.industry] += percentage;
      
      if (!assetTypeConcentration[inv.asset_type]) {
        assetTypeConcentration[inv.asset_type] = 0;
      }
      assetTypeConcentration[inv.asset_type] += percentage;
    });

    // Analyze with AI
    const analysisPrompt = `
You are a portfolio risk analyst. Analyze this investment portfolio for potential risks.

PORTFOLIO DATA:
Total Value: $${totalValue.toLocaleString()}
Number of Investments: ${investments.length}

Industry Concentration: ${JSON.stringify(industryConcentration, null, 2)}
Asset Type Concentration: ${JSON.stringify(assetTypeConcentration, null, 2)}

Individual Investments:
${investments.map(inv => `
- ${inv.investment_name}
  Initial: $${inv.initial_investment}
  Current: $${inv.current_value || inv.initial_investment}
  ROI: ${inv.actual_roi || 0}%
  Status: ${inv.status}
  Industry: ${inv.industry}
`).join('\n')}

Identify:
1. Over-concentration risks (single industry/asset >30%)
2. Underperforming investments (negative ROI)
3. Liquidity concerns
4. Diversification gaps
5. Market timing risks
6. Correlation risks

Provide actionable recommendations for each risk.
`;

    const riskAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_risk_level: {
            type: 'string',
            enum: ['low', 'moderate', 'high', 'critical']
          },
          risk_score: {
            type: 'number',
            description: 'Risk score 0-100'
          },
          identified_risks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                risk_type: {
                  type: 'string',
                  enum: ['concentration', 'underperformance', 'liquidity', 'diversification', 'market_timing', 'correlation']
                },
                severity: {
                  type: 'string',
                  enum: ['low', 'medium', 'high', 'critical']
                },
                description: {
                  type: 'string'
                },
                affected_investments: {
                  type: 'array',
                  items: { type: 'string' }
                },
                recommendation: {
                  type: 'string'
                },
                action_items: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          },
          portfolio_health_score: {
            type: 'number',
            description: 'Overall health 0-100'
          }
        }
      }
    });

    // Create alert for high risks
    if (riskAnalysis.overall_risk_level === 'high' || riskAnalysis.overall_risk_level === 'critical') {
      await base44.entities.InvestmentAlert.create({
        title: 'Portfolio Risk Alert',
        description: `Your portfolio has been flagged with ${riskAnalysis.overall_risk_level} risk level. Immediate attention recommended.`,
        severity: riskAnalysis.overall_risk_level === 'critical' ? 'high' : 'medium',
        alert_type: 'portfolio_risk',
        affected_areas: Object.keys(industryConcentration),
        recommended_action: riskAnalysis.identified_risks[0]?.recommendation || 'Review portfolio allocation'
      });
    }

    return Response.json({
      success: true,
      analysis: riskAnalysis,
      portfolio_metrics: {
        total_value: totalValue,
        investment_count: investments.length,
        industry_concentration: industryConcentration,
        asset_type_concentration: assetTypeConcentration
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});