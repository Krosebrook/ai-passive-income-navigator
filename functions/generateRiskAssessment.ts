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

    const deal = await base44.entities.SourcedDealOpportunity.get(deal_id);

    // Gather comprehensive context
    const marketData = await base44.asServiceRole.entities.MarketDataSnapshot.list('-snapshot_date', 1);
    const userPrefs = await base44.entities.UserPreferences.filter({ created_by: user.email });

    const prompt = `
You are a risk assessment expert. Generate a comprehensive risk assessment report for this investment opportunity.

DEAL DETAILS:
- Title: ${deal.title}
- Industry: ${deal.industry}
- Description: ${deal.description}
- Required Investment: $${deal.required_investment}
- Deal Structure: ${deal.deal_structure}
- Estimated ROI: ${deal.estimated_roi}%
- Time to Profit: ${deal.time_to_roi}
- Current Risk Score: ${deal.risk_score}/10

MARKET CONDITIONS:
- Market Sentiment: ${marketData[0]?.sentiment_score || 'neutral'}
- Industry Volatility: ${marketData[0]?.volatility_index || 'unknown'}

USER PROFILE:
- Risk Tolerance: ${userPrefs[0]?.risk_tolerance || 'moderate'}
- Investment Goals: ${userPrefs[0]?.target_return_percentage || 15}% target return

Generate a detailed risk assessment including:
1. Overall risk rating (low, medium, high, critical)
2. Specific risk factors categorized by type (market, operational, financial, competitive, regulatory)
3. Red flags that require immediate attention
4. Risk mitigation strategies for each identified risk
5. Probability and impact assessment for major risks
6. Alignment with user's risk tolerance
7. Recommended actions before proceeding
`;

    const riskAssessment = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_risk_rating: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical']
          },
          risk_score: {
            type: 'number',
            description: 'Risk score from 1-10'
          },
          risk_factors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                risk: { type: 'string' },
                severity: { type: 'string' },
                probability: { type: 'string' },
                impact: { type: 'string' }
              }
            }
          },
          red_flags: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                flag: { type: 'string' },
                severity: { type: 'string' },
                explanation: { type: 'string' }
              }
            }
          },
          mitigation_strategies: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                risk: { type: 'string' },
                strategy: { type: 'string' },
                implementation: { type: 'string' }
              }
            }
          },
          user_alignment: {
            type: 'object',
            properties: {
              matches_tolerance: { type: 'boolean' },
              recommendation: { type: 'string' }
            }
          },
          recommended_actions: {
            type: 'array',
            items: { type: 'string' }
          },
          executive_summary: { type: 'string' }
        }
      }
    });

    // Update deal with risk assessment
    await base44.entities.SourcedDealOpportunity.update(deal_id, {
      comprehensive_risk_assessment: riskAssessment,
      risk_assessed_at: new Date().toISOString(),
      predicted_risk_score: riskAssessment.risk_score
    });

    return Response.json({
      success: true,
      assessment: riskAssessment
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});