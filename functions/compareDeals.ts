import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI-assisted deal comparison tool
 * Compares multiple deals and provides recommendation
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dealIds } = await req.json();

    if (!dealIds || dealIds.length < 2) {
      return Response.json({ error: 'At least 2 deals required' }, { status: 400 });
    }

    // Get all deals
    const dealsPromises = dealIds.map(id => 
      base44.entities.SourcedDealOpportunity.filter({ id })
    );
    const dealsResults = await Promise.all(dealsPromises);
    const deals = dealsResults.map(r => r[0]).filter(Boolean);

    const prompt = `Compare these ${deals.length} investment opportunities:

${deals.map((d, i) => `
DEAL ${i + 1}: ${d.deal_title}
- Investment: $${d.estimated_investment}
- ROI: ${d.estimated_roi}%
- Risk: ${d.risk_level}
- Industry: ${d.industry}
- Description: ${d.deal_description}
`).join('\n')}

Provide:
1. Side-by-side comparison table
2. Best overall deal (with reasoning)
3. Best for different scenarios (e.g., best for low risk, best ROI, best quick return)
4. Key differentiators between deals
5. Risk-adjusted recommendation
6. Diversification recommendation (if investing in multiple)`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          comparison_table: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                deal_title: { type: 'string' },
                pros: { type: 'array', items: { type: 'string' } },
                cons: { type: 'array', items: { type: 'string' } },
                score: { type: 'number' }
              }
            }
          },
          best_overall: {
            type: 'object',
            properties: {
              deal_title: { type: 'string' },
              reasoning: { type: 'string' }
            }
          },
          best_for_scenarios: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                scenario: { type: 'string' },
                deal_title: { type: 'string' },
                reason: { type: 'string' }
              }
            }
          },
          key_differentiators: { type: 'array', items: { type: 'string' } },
          final_recommendation: { type: 'string' }
        }
      }
    });

    return Response.json({
      success: true,
      comparison: response
    });

  } catch (error) {
    console.error('Deal comparison error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});