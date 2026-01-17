import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI-powered deal sourcing - scans online markets for passive income opportunities
 * Uses internet context to find real deals matching user criteria
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { criteriaId } = await req.json();

    // Get criteria
    const criteria = await base44.entities.DealSourcingCriteria.filter({ id: criteriaId });
    if (!criteria || criteria.length === 0) {
      return Response.json({ error: 'Criteria not found' }, { status: 404 });
    }

    const userCriteria = criteria[0];

    const prompt = `You are a passive income deal sourcing AI. Search the internet for real passive income business opportunities that match these criteria:

INVESTMENT CRITERIA:
- Budget: $${userCriteria.min_investment || 0} - $${userCriteria.max_investment || 'unlimited'}
- Risk Tolerance: ${userCriteria.risk_tolerance || 'medium'}
- Desired ROI: ${userCriteria.desired_roi_percentage || 20}% annually
- Preferred Industries: ${userCriteria.preferred_industries?.join(', ') || 'any'}
- Excluded Industries: ${userCriteria.excluded_industries?.join(', ') || 'none'}
- Time to Profitability: ${userCriteria.time_to_profitability_months || 12} months
- Passive Level: ${userCriteria.passive_level || 'semi_passive'}

SEARCH ONLINE MARKETPLACES:
Search platforms like Flippa, Empire Flippers, MicroAcquire, BizBuySell, FE International, and other business-for-sale marketplaces.

Find 5-8 REAL opportunities currently available that match the criteria. For each opportunity, provide:

1. Deal Title (actual listing title)
2. Detailed description
3. Source URL (actual marketplace URL if available)
4. Source Platform name
5. Investment amount required
6. Estimated ROI percentage
7. Monthly revenue (if available)
8. Industry/niche
9. Risk level assessment (low/medium/high)
10. Match score (0-100) - how well it matches the criteria
11. Key highlights (3-5 positive points)
12. Potential concerns (2-3 risks or considerations)

Return as JSON array of opportunities.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                deal_title: { type: 'string' },
                deal_description: { type: 'string' },
                source_url: { type: 'string' },
                source_platform: { type: 'string' },
                estimated_investment: { type: 'number' },
                estimated_roi: { type: 'number' },
                monthly_revenue: { type: 'number' },
                industry: { type: 'string' },
                risk_level: { type: 'string' },
                ai_match_score: { type: 'number' },
                key_highlights: { type: 'array', items: { type: 'string' } },
                potential_concerns: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    });

    // Save opportunities to database
    const savedOpportunities = [];
    for (const opp of response.opportunities || []) {
      const saved = await base44.entities.SourcedDealOpportunity.create({
        ...opp,
        criteria_id: criteriaId,
        status: 'new'
      });
      savedOpportunities.push(saved);
    }

    return Response.json({
      success: true,
      opportunities_found: savedOpportunities.length,
      opportunities: savedOpportunities
    });

  } catch (error) {
    console.error('Deal sourcing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});