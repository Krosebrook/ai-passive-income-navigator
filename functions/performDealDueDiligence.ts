import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dealId } = await req.json();

    if (!dealId) {
      return Response.json({ error: 'dealId is required' }, { status: 400 });
    }

    // Fetch the deal
    const deals = await base44.entities.SourcedDealOpportunity.filter({ id: dealId });
    const deal = deals[0];

    if (!deal) {
      return Response.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Construct AI analysis prompt
    const prompt = `You are an expert deal analyst performing deep due diligence. Analyze the following passive income deal:

**Deal Title:** ${deal.title}
**Industry:** ${deal.industry}
**Summary:** ${deal.summary}
**Description:** ${deal.description || 'N/A'}
**How to Pursue:** ${deal.how_to_pursue || 'N/A'}
**Key Risks:** ${deal.key_risks?.join(', ') || 'N/A'}
**Key Opportunities:** ${deal.key_opportunities?.join(', ') || 'N/A'}
**Risk Score:** ${deal.risk_score || 'N/A'}/10

Perform the following analysis:
1. Extract 3-5 actionable steps from "How to Pursue" - concrete actions the user should take
2. Identify 2-4 potential red flags or warning signs in this deal
3. For each key risk, provide a specific mitigation strategy
4. Provide a concise viability summary (2-3 sentences) focusing on: overall deal viability, key differentiators, and whether this is a strong opportunity

Return your analysis in the following JSON format:`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          actionable_steps: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of concrete actionable steps'
          },
          red_flags: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of potential red flags or concerns'
          },
          risk_mitigation: {
            type: 'object',
            description: 'Risk mitigation strategies keyed by risk',
            additionalProperties: { type: 'string' }
          },
          viability_summary: {
            type: 'string',
            description: 'Concise 2-3 sentence viability assessment'
          }
        },
        required: ['actionable_steps', 'red_flags', 'risk_mitigation', 'viability_summary']
      }
    });

    // Update the deal with AI insights
    await base44.entities.SourcedDealOpportunity.update(dealId, {
      dd_actionable_steps: response.actionable_steps,
      dd_red_flags: response.red_flags,
      dd_risk_mitigation: response.risk_mitigation,
      dd_viability_summary: response.viability_summary,
      dd_analyzed_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      analysis: response
    });

  } catch (error) {
    console.error('Due diligence error:', error);
    return Response.json({ 
      error: error.message || 'Failed to perform due diligence' 
    }, { status: 500 });
  }
});