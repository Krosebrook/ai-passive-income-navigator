import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { idea } = await req.json();

    if (!idea) {
      return Response.json({ error: 'Idea data required' }, { status: 400 });
    }

    const prompt = `Analyze this passive income idea and provide a viability assessment:

Idea: ${idea.title}
Description: ${idea.description}
Category: ${idea.category}
Difficulty: ${idea.difficulty || 'Not specified'}

Please provide:
1. A viability score from 0-100 based on:
   - Current market demand and trends
   - Level of competition in this space
   - Estimated profitability potential
   - Time-to-profit feasibility
   - Required startup capital vs potential returns

2. Key opportunities (3-5 bullets)
3. Critical risks (3-5 bullets)
4. A brief 2-3 sentence summary

Return as JSON with this structure:
{
  "viability_score": number,
  "opportunities": ["opportunity1", "opportunity2", ...],
  "risks": ["risk1", "risk2", ...],
  "summary": "Brief analysis summary"
}`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          viability_score: { type: 'number', minimum: 0, maximum: 100 },
          opportunities: { type: 'array', items: { type: 'string' } },
          risks: { type: 'array', items: { type: 'string' } },
          summary: { type: 'string' }
        }
      }
    });

    return Response.json(analysis);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});