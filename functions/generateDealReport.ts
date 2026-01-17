import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Automated deal summary report generator
 * Creates comprehensive analysis report for deals
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dealId } = await req.json();

    const deals = await base44.entities.SourceedDealOpportunity.filter({ id: dealId });
    const deal = deals[0];

    if (!deal) {
      return Response.json({ error: 'Deal not found' }, { status: 404 });
    }

    const prompt = `Create a comprehensive executive summary report for this investment opportunity:

${JSON.stringify(deal, null, 2)}

Use internet context to research the industry, market conditions, and comparable deals.

Provide a structured report with:
1. Executive Summary (2-3 paragraphs)
2. Investment Highlights (5-7 bullet points)
3. Risk Analysis (3-5 key risks)
4. Market Context (industry trends, competition)
5. Financial Overview (investment, returns, timeline)
6. Due Diligence Checklist (8-10 items)
7. Comparable Deals (if found online)
8. Final Recommendation (invest, pass, more_info_needed)`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary: { type: 'string' },
          investment_highlights: { type: 'array', items: { type: 'string' } },
          risk_analysis: { type: 'array', items: { type: 'string' } },
          market_context: { type: 'string' },
          financial_overview: {
            type: 'object',
            properties: {
              required_investment: { type: 'string' },
              expected_returns: { type: 'string' },
              timeline: { type: 'string' },
              roi_analysis: { type: 'string' }
            }
          },
          due_diligence_checklist: { type: 'array', items: { type: 'string' } },
          comparable_deals: { type: 'array', items: { type: 'string' } },
          final_recommendation: { type: 'string' },
          recommendation_reasoning: { type: 'string' }
        }
      }
    });

    return Response.json({
      success: true,
      report: response,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});