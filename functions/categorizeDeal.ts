import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI-powered deal categorization and prioritization
 * Automatically categorizes incoming deals and assigns priority
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dealId } = await req.json();

    // Get deal and user criteria
    const [deals, criteria] = await Promise.all([
      base44.entities.SourcedDealOpportunity.filter({ id: dealId }),
      base44.entities.DealSourcingCriteria.filter({ created_by: user.email })
    ]);

    const deal = deals[0];
    if (!deal) {
      return Response.json({ error: 'Deal not found' }, { status: 404 });
    }

    const prompt = `Analyze this deal opportunity and categorize it:

DEAL:
${JSON.stringify(deal, null, 2)}

USER CRITERIA:
${JSON.stringify(criteria, null, 2)}

Provide:
1. Category (hot_lead, warm_lead, cold_lead, nurture, pass)
2. Priority score (0-100)
3. Match quality (excellent, good, fair, poor)
4. Key reasons for categorization
5. Recommended next actions (3-5 specific steps)
6. Timeline for follow-up (immediate, within_24h, within_week, within_month)`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          priority_score: { type: 'number' },
          match_quality: { type: 'string' },
          reasons: { type: 'array', items: { type: 'string' } },
          next_actions: { type: 'array', items: { type: 'string' } },
          follow_up_timeline: { type: 'string' }
        }
      }
    });

    // Update deal with categorization
    await base44.entities.SourcedDealOpportunity.update(dealId, {
      ai_category: response.category,
      ai_priority_score: response.priority_score,
      ai_match_quality: response.match_quality
    });

    return Response.json({
      success: true,
      categorization: response
    });

  } catch (error) {
    console.error('Deal categorization error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});