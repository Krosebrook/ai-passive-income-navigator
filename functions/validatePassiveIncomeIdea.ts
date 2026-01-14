import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI-powered validation for passive income ideas
 * Analyzes market viability, competition, monetization potential, and risks
 * Returns a comprehensive validation score and actionable feedback
 * 
 * @param {string} ideaTitle - The title of the idea
 * @param {string} ideaDescription - Detailed description of the idea
 * @param {string} targetMarket - Target market/audience
 * @param {string} initialInvestment - Estimated initial investment
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ideaTitle, ideaDescription, targetMarket, initialInvestment } = await req.json();

    const prompt = `Conduct a comprehensive validation assessment of this passive income idea:

IDEA DETAILS:
Title: ${ideaTitle}
Description: ${ideaDescription}
Target Market: ${targetMarket}
Initial Investment: ${initialInvestment}

Evaluate the idea across these dimensions:

1. MARKET VIABILITY (0-100 score)
   - Market size and growth rate
   - Target audience demand
   - Market saturation level
   - Timing and trends

2. COMPETITIVE LANDSCAPE (0-100 score)
   - Number and strength of competitors
   - Differentiation opportunities
   - Barriers to entry
   - Market positioning potential

3. MONETIZATION POTENTIAL (0-100 score)
   - Revenue model feasibility
   - Pricing power
   - Customer acquisition cost vs. lifetime value
   - Scalability potential
   - Alternative revenue streams

4. EXECUTION RISK (0-100 score, lower is better)
   - Technical complexity
   - Regulatory/legal risks
   - Skills and knowledge gaps
   - Time to profitability
   - Resource requirements

5. FINANCIAL VIABILITY (0-100 score)
   - Profitability timeline
   - Expected ROI potential
   - Burn rate concerns
   - Capital efficiency

Return JSON:
{
  "overall_validation_score": number (0-100),
  "viability_scores": {
    "market_viability": number,
    "competitive_landscape": number,
    "monetization_potential": number,
    "execution_risk": number,
    "financial_viability": number
  },
  "validation_summary": "string (2-3 sentences)",
  "market_analysis": {
    "market_size": "string",
    "growth_potential": "string",
    "saturation_level": "low|moderate|high",
    "time_to_market": "string"
  },
  "competition_analysis": {
    "direct_competitors": number,
    "indirect_competitors": number,
    "competitive_advantage_opportunities": ["opp1", "opp2"],
    "market_gaps": ["gap1", "gap2"]
  },
  "monetization_strategy": {
    "primary_revenue_model": "string",
    "alternative_models": ["model1", "model2"],
    "pricing_strategy": "string",
    "projected_monthly_revenue": "string"
  },
  "risk_assessment": [
    {
      "risk": "string",
      "severity": "low|medium|high",
      "likelihood": "low|medium|high",
      "mitigation": "string"
    }
  ],
  "success_factors": ["factor1", "factor2"],
  "improvement_suggestions": ["suggestion1", "suggestion2"],
  "go_no_go_recommendation": "string (proceed with caution|recommended|strong green light)"
}`;

    const validation = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_validation_score: { type: 'number' },
          viability_scores: { type: 'object' },
          validation_summary: { type: 'string' },
          market_analysis: { type: 'object' },
          competition_analysis: { type: 'object' },
          monetization_strategy: { type: 'object' },
          risk_assessment: { type: 'array', items: { type: 'object' } },
          success_factors: { type: 'array', items: { type: 'string' } },
          improvement_suggestions: { type: 'array', items: { type: 'string' } },
          go_no_go_recommendation: { type: 'string' }
        }
      }
    });

    return Response.json(validation);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});