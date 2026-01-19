import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { preferences, count = 5 } = await req.json();

    // Generate AI deals using LLM
    const prompt = `Based on this user profile, generate ${count} personalized investment deal opportunities:

User Preferences:
- Primary Goal: ${preferences?.passive_income_goal || 'passive income'}
- Risk Tolerance: ${preferences?.risk_tolerance || 'moderate'}
- Investment Range: $${preferences?.investment_size_min || 5000} - $${preferences?.investment_size_max || 50000}
- Industries: ${preferences?.target_industries?.join(', ') || 'various'}
- Time Horizon: ${preferences?.time_horizon || 'medium-term'}

For each deal, provide:
1. Title (concise, specific)
2. Industry
3. Summary (2-3 sentences)
4. Estimated Value (USD)
5. Estimated ROI (%)
6. Time to ROI (e.g., "6-12 months")
7. Risk Score (1-10, where 1 is lowest risk)
8. Match Score (1-100, how well it matches user preferences)
9. Key Opportunities (3 bullet points)
10. Key Risks (2-3 bullet points)

Return as JSON array.`;

    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          deals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                industry: { type: 'string' },
                summary: { type: 'string' },
                estimated_value: { type: 'number' },
                estimated_roi: { type: 'number' },
                time_to_roi: { type: 'string' },
                risk_score: { type: 'number' },
                match_score: { type: 'number' },
                key_opportunities: { type: 'array', items: { type: 'string' } },
                key_risks: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    });

    // Save deals to database
    const deals = aiResult.deals.map(deal => ({
      ...deal,
      is_generated: true,
      status: 'pending',
      source: 'ai_generated'
    }));

    await base44.asServiceRole.entities.SourcedDealOpportunity.bulkCreate(deals);

    return Response.json({ 
      success: true, 
      count: deals.length,
      deals 
    });

  } catch (error) {
    console.error('Error generating AI deals:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to generate AI deals'
    }, { status: 500 });
  }
});