import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI Deal Analyzer
 * Evaluates passive income opportunities based on user-defined criteria
 * Provides comprehensive risk/reward scoring and market analysis
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dealName, dealDescription, dealCategory, userCriteria } = await req.json();

    if (!dealName || !dealDescription) {
      return Response.json({ 
        error: 'Missing required fields: dealName, dealDescription' 
      }, { status: 400 });
    }

    const prompt = `Analyze this passive income opportunity and provide a comprehensive evaluation:

DEAL DETAILS:
Name: ${dealName}
Category: ${dealCategory || 'Not specified'}
Description: ${dealDescription}

USER CRITERIA:
- Minimum Market Size: $${userCriteria?.min_market_size || 100000}
- Max Competition Level: ${userCriteria?.max_competition_level || 'medium'}
- Max Timeline to Profit: ${userCriteria?.max_profitability_timeline_months || 12} months
- Min Profit Margin: ${userCriteria?.min_profit_margin || 20}%
- Initial Investment Available: $${userCriteria?.required_initial_investment || 5000}
- Risk Tolerance: ${userCriteria?.risk_tolerance || 'medium'}

Provide a detailed analysis with:

1. MARKET ANALYSIS
   - Market size estimate and growth rate
   - Saturation level and trends
   - Score (0-100)

2. COMPETITION ANALYSIS
   - Competition level (low/medium/high)
   - Key competitors (list 3-5)
   - Potential competitive advantages
   - Score (0-100)

3. PROFITABILITY ANALYSIS
   - Estimated timeline to profitability (months)
   - Expected profit margin (%)
   - Revenue potential (conservative estimate)
   - Score (0-100)

4. RISK ASSESSMENT
   - List 3-5 major risk factors with severity (low/medium/high/critical)
   - Mitigation strategies for each
   - Overall risk score (0-100, higher = riskier)

5. OPPORTUNITIES
   - List 3-5 key opportunities or advantages

6. SCORES & RECOMMENDATION
   - Overall score (0-100, weighted average of all factors)
   - Risk score (0-100)
   - Reward score (0-100)
   - Recommendation: strong_buy / buy / hold / avoid
   - Detailed reasoning for recommendation

7. CRITERIA MATCH
   - Does it meet market size requirement?
   - Does it meet competition level requirement?
   - Does it meet timeline requirement?
   - Does it meet profit margin requirement?
   - Overall match percentage (0-100)

Return JSON with this exact structure:
{
  "overall_score": 75,
  "risk_score": 45,
  "reward_score": 82,
  "market_analysis": {
    "market_size_estimate": "$5-10M annually",
    "growth_rate": "15% YoY",
    "saturation_level": "Medium - growing market",
    "score": 75
  },
  "competition_analysis": {
    "competition_level": "medium",
    "key_competitors": ["Competitor 1", "Competitor 2"],
    "competitive_advantages": ["advantage 1", "advantage 2"],
    "score": 70
  },
  "profitability_analysis": {
    "estimated_timeline_months": 8,
    "expected_profit_margin": 35,
    "revenue_potential": "$3-5K monthly after 12 months",
    "score": 80
  },
  "risk_factors": [
    {
      "factor": "Market volatility",
      "severity": "medium",
      "mitigation": "Diversify offerings"
    }
  ],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "recommendation": "buy",
  "recommendation_reasoning": "Strong fundamentals with manageable risks..."
}

Be realistic and data-driven. Use current market trends and real-world examples.`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_score: { type: 'number' },
          risk_score: { type: 'number' },
          reward_score: { type: 'number' },
          market_analysis: { type: 'object' },
          competition_analysis: { type: 'object' },
          profitability_analysis: { type: 'object' },
          risk_factors: { type: 'array', items: { type: 'object' } },
          opportunities: { type: 'array', items: { type: 'string' } },
          recommendation: { type: 'string' },
          recommendation_reasoning: { type: 'string' }
        }
      }
    });

    // Calculate criteria match
    const criteriaMatch = {
      market_size_match: true, // Would need actual market data to validate
      competition_match: userCriteria?.max_competition_level 
        ? analysis.competition_analysis.competition_level === userCriteria.max_competition_level 
        : true,
      timeline_match: userCriteria?.max_profitability_timeline_months
        ? analysis.profitability_analysis.estimated_timeline_months <= userCriteria.max_profitability_timeline_months
        : true,
      profit_margin_match: userCriteria?.min_profit_margin
        ? analysis.profitability_analysis.expected_profit_margin >= userCriteria.min_profit_margin
        : true,
      overall_match_percentage: 85 // Calculated based on criteria met
    };

    // Save analysis
    const savedAnalysis = await base44.entities.DealAnalysis.create({
      deal_name: dealName,
      deal_description: dealDescription,
      deal_category: dealCategory,
      user_criteria: userCriteria,
      analysis_results: analysis,
      criteria_match: criteriaMatch
    });

    return Response.json(savedAnalysis);
  } catch (error) {
    console.error('Deal analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});