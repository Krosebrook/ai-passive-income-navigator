import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Enhanced AI Deal Analyzer
 * - Real-time market data integration
 * - Document analysis capability
 * - Economic scenario simulation
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      dealName, 
      dealDescription, 
      dealCategory, 
      userCriteria,
      documentUrls = [],
      runScenarios = false
    } = await req.json();

    if (!dealName || !dealDescription) {
      return Response.json({ 
        error: 'Missing required fields: dealName, dealDescription' 
      }, { status: 400 });
    }

    // Step 1: Gather real-time market intelligence
    const marketDataPrompt = `Fetch real-time market data for this opportunity:
- Deal: ${dealName}
- Category: ${dealCategory || 'Not specified'}
- Description: ${dealDescription}

Search for:
1. Current market size and growth trends (2024-2026 data)
2. Recent news and market sentiment
3. Top competitors and their market share
4. Keyword search volume and trending topics
5. Industry benchmark profit margins
6. Economic indicators affecting this market

Return structured market intelligence.`;

    const marketData = await base44.integrations.Core.InvokeLLM({
      prompt: marketDataPrompt,
      add_context_from_internet: true
    });

    // Step 2: Analyze uploaded documents if provided
    let documentInsights = '';
    if (documentUrls.length > 0) {
      const docPrompt = `Analyze these business documents and extract key insights:
- Financial projections
- Revenue models
- Cost structures
- Market assumptions
- Competitive positioning

Provide a summary of strengths, weaknesses, and key numbers.`;

      documentInsights = await base44.integrations.Core.InvokeLLM({
        prompt: docPrompt,
        file_urls: documentUrls
      });
    }

    // Step 3: Main comprehensive analysis
    const prompt = `Analyze this passive income opportunity with REAL-TIME MARKET DATA:

DEAL DETAILS:
Name: ${dealName}
Category: ${dealCategory || 'Not specified'}
Description: ${dealDescription}

REAL-TIME MARKET INTELLIGENCE:
${marketData}

${documentInsights ? `UPLOADED DOCUMENT ANALYSIS:\n${documentInsights}\n` : ''}

USER CRITERIA:
- Minimum Market Size: $${userCriteria?.min_market_size || 100000}
- Max Competition Level: ${userCriteria?.max_competition_level || 'medium'}
- Max Timeline to Profit: ${userCriteria?.max_profitability_timeline_months || 12} months
- Min Profit Margin: ${userCriteria?.min_profit_margin || 20}%
- Initial Investment Available: $${userCriteria?.required_initial_investment || 5000}
- Risk Tolerance: ${userCriteria?.risk_tolerance || 'medium'}

Use the REAL-TIME data to provide an accurate, current analysis with:

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
    const matches = [];
    if (userCriteria?.max_competition_level) {
      const compLevels = { low: 1, medium: 2, high: 3 };
      matches.push(compLevels[analysis.competition_analysis.competition_level] <= compLevels[userCriteria.max_competition_level]);
    }
    if (userCriteria?.max_profitability_timeline_months) {
      matches.push(analysis.profitability_analysis.estimated_timeline_months <= userCriteria.max_profitability_timeline_months);
    }
    if (userCriteria?.min_profit_margin) {
      matches.push(analysis.profitability_analysis.expected_profit_margin >= userCriteria.min_profit_margin);
    }
    
    const criteriaMatch = {
      market_size_match: true,
      competition_match: matches[0] !== undefined ? matches[0] : true,
      timeline_match: matches[1] !== undefined ? matches[1] : true,
      profit_margin_match: matches[2] !== undefined ? matches[2] : true,
      overall_match_percentage: Math.round((matches.filter(Boolean).length / Math.max(matches.length, 1)) * 100)
    };

    // Step 4: Run economic scenario simulations if requested
    let scenarios = null;
    if (runScenarios) {
      const scenarioPrompt = `Based on the deal analysis, simulate 3 economic scenarios and their impact:

DEAL: ${dealName}
BASE ANALYSIS: ${JSON.stringify(analysis.profitability_analysis)}

Simulate these scenarios:
1. OPTIMISTIC: Bull market, high consumer spending, favorable regulations
2. BASE CASE: Normal market conditions, steady growth
3. PESSIMISTIC: Economic downturn, reduced spending, increased competition

For each scenario, provide:
- Revenue impact (% change from base)
- Profit margin impact
- Timeline to profitability adjustment
- Risk level change
- Key triggers and indicators
- Recommended actions

Return as JSON array with structured scenario objects.`;

      scenarios = await base44.integrations.Core.InvokeLLM({
        prompt: scenarioPrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            scenarios: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  scenario_name: { type: 'string' },
                  probability: { type: 'string' },
                  revenue_impact_pct: { type: 'number' },
                  profit_margin_impact: { type: 'number' },
                  timeline_adjustment_months: { type: 'number' },
                  risk_level: { type: 'string' },
                  key_triggers: { type: 'array', items: { type: 'string' } },
                  recommended_actions: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      });
    }

    // Save comprehensive analysis
    const savedAnalysis = await base44.entities.DealAnalysis.create({
      deal_name: dealName,
      deal_description: dealDescription,
      deal_category: dealCategory,
      user_criteria: userCriteria,
      analysis_results: {
        ...analysis,
        market_data_timestamp: new Date().toISOString(),
        document_analysis_included: documentUrls.length > 0,
        scenarios: scenarios?.scenarios || null
      },
      criteria_match: criteriaMatch
    });

    return Response.json(savedAnalysis);
  } catch (error) {
    console.error('Deal analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});