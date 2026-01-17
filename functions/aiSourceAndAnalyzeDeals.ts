import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user preferences and portfolio goals
    const preferences = await base44.entities.UserPreferences.filter({
      created_by: user.email
    });
    const userPrefs = preferences[0];

    if (!userPrefs) {
      return Response.json({ deals: [] });
    }

    // Fetch existing feedback to avoid re-suggesting rejected deals
    const feedback = await base44.entities.AIDealsUserFeedback.filter({
      created_by: user.email
    });
    const rejectedDealIds = new Set(
      feedback.filter(f => f.action === 'rejected').map(f => f.deal_id)
    );

    // Build AI prompt based on user preferences
    const prompt = `You are an expert investment analyst. Based on the following investor profile, identify and analyze 3-5 realistic deal opportunities that match their investment strategy.

INVESTOR PROFILE:
- Risk Tolerance: ${userPrefs.risk_tolerance || 'moderate'}
- Target Industries: ${userPrefs.target_industries?.join(', ') || 'diversified'}
- Investment Size: $${userPrefs.investment_size_min?.toLocaleString() || '10,000'} - $${userPrefs.investment_size_max?.toLocaleString() || '500,000'}
- Time Horizon: ${userPrefs.time_horizon || 'medium_term'}
- Target Annual Return: ${userPrefs.target_return_percentage || '15'}%
- Diversification: ${userPrefs.diversification_preference || 'balanced'}

Return a JSON array of deal objects with EXACTLY this structure:
[
  {
    "deal_title": "Specific Deal Name",
    "deal_description": "2-3 sentence description of the deal",
    "industry": "Industry",
    "estimated_investment": 50000,
    "estimated_roi": 25,
    "risk_level": "low|medium|high",
    "source_platform": "Platform Name",
    "ai_match_score": 85,
    "fit_summary": "Concise explanation why this matches their strategy (1-2 sentences)",
    "potential_concerns": ["Concern 1", "Concern 2"],
    "key_highlights": ["Highlight 1", "Highlight 2"]
  }
]

Be specific with company names and realistic deal details. Focus on deals that genuinely match the investor's risk profile and goals.`;

    // Call AI to source deals
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          deals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                deal_title: { type: 'string' },
                deal_description: { type: 'string' },
                industry: { type: 'string' },
                estimated_investment: { type: 'number' },
                estimated_roi: { type: 'number' },
                risk_level: { type: 'string' },
                source_platform: { type: 'string' },
                ai_match_score: { type: 'number' },
                fit_summary: { type: 'string' },
                potential_concerns: { type: 'array', items: { type: 'string' } },
                key_highlights: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    });

    // Store sourced deals and filter out rejected ones
    const deals = aiResponse.deals || [];
    const filteredDeals = deals.filter(deal => !rejectedDealIds.has(deal.deal_title));

    // Store deals for future reference
    for (const deal of filteredDeals) {
      await base44.entities.SourcedDealOpportunity.create({
        deal_title: deal.deal_title,
        deal_description: deal.deal_description,
        source_url: `ai-sourced-${Date.now()}`,
        source_platform: deal.source_platform,
        estimated_investment: deal.estimated_investment,
        estimated_roi: deal.estimated_roi,
        industry: deal.industry,
        risk_level: deal.risk_level,
        ai_match_score: deal.ai_match_score,
        key_highlights: deal.key_highlights,
        potential_concerns: deal.potential_concerns,
        status: 'new'
      });
    }

    return Response.json({ deals: filteredDeals });
  } catch (error) {
    console.error('Error in aiSourceAndAnalyzeDeals:', error);
    return Response.json({ error: error.message, deals: [] }, { status: 500 });
  }
});