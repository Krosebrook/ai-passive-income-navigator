import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * AI Field Assistant - powers intelligent autocomplete/suggestions for any form field.
 * Uses web search for real-world data when context warrants it.
 * Returns top 5 suggestions with reasoning.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { field, value, context, form_type } = await req.json();
    if (!field) return Response.json({ error: 'field required' }, { status: 400 });

    const needsWebSearch = ['deal_name', 'industry', 'description', 'company', 'market', 'competitor'].some(k =>
      field.toLowerCase().includes(k)
    );

    const prompt = buildPrompt(field, value, context, form_type);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: needsWebSearch,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                value: { type: 'string' },
                label: { type: 'string' },
                reasoning: { type: 'string' },
                source: { type: 'string' },
                confidence: { type: 'number' }
              }
            }
          },
          context_insight: { type: 'string' }
        }
      }
    });

    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildPrompt(field, value, context, formType) {
  const ctx = context ? `\nContext: ${JSON.stringify(context)}` : '';
  const currentVal = value ? `\nCurrent input: "${value}"` : '';

  const fieldPrompts = {
    deal_name: `You are a deal sourcing expert. Suggest 5 specific, realistic deal/business opportunity names for an investor's pipeline.
Based on current market trends, hot sectors (AI, climate tech, SaaS, fintech, healthcare), and high-ROI passive income opportunities.${currentVal}${ctx}
Return 5 concrete deal names with brief reasoning for each. Be specific - not generic.`,

    deal_description: `You are an investment analyst. Write 5 compelling deal descriptions for: "${value || 'a business opportunity'}"${ctx}
Each description should cover: business model, revenue mechanism, why now, target market size.
Keep each under 100 words. Make them realistic and investment-grade.`,

    industry: `You are a market analyst. Suggest 5 specific industry/sector tags for deal categorization in ${new Date().getFullYear()}.${currentVal}${ctx}
Include emerging and high-growth sectors. Be specific (e.g., "B2B SaaS - Vertical AI" not just "Tech").`,

    estimated_value: `You are a deal valuation expert. Based on the deal context, suggest 5 realistic valuation ranges.${currentVal}${ctx}
Consider current market multiples, comparable deals, and typical passive income deal sizes ($10K-$10M range).
Return values as numbers (USD).`,

    company: `Research and suggest 5 real companies or founders in this space that an investor might want to reach out to.${currentVal}${ctx}
Include company name, their focus area, and why they're a good match. Use real, verifiable companies.`,

    notes: `You are an investment advisor. Suggest 5 key notes/observations an investor should document about this deal.${currentVal}${ctx}
Focus on: due diligence checklist items, risk flags, opportunity highlights, and next steps.`,

    default: `You are an AI assistant helping fill out a deal/investment form field: "${field}"${currentVal}${ctx}
Provide 5 high-quality, specific suggestions that would help an investor. Each suggestion should be immediately useful and actionable.`
  };

  const matchedKey = Object.keys(fieldPrompts).find(k => field.toLowerCase().includes(k)) || 'default';
  return fieldPrompts[matchedKey];
}