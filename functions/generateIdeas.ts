import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userPreferences } = await req.json();

    if (!userPreferences) {
      return Response.json({ error: 'User preferences required' }, { status: 400 });
    }

    const prompt = `Generate 5 unique and innovative passive income ideas based on the following user profile:

User Interests: ${userPreferences.interests?.join(', ') || 'Not specified'}
Skills: ${userPreferences.existing_skills?.join(', ') || 'Not specified'}
Risk Tolerance: ${userPreferences.risk_tolerance || '2'}/4
Time Commitment: ${userPreferences.time_commitment || '2'}/4 hours per week
Tech Comfort: ${userPreferences.tech_comfort_level || '2'}/4
Target Income: $${userPreferences.target_monthly_income || '1000'}/month
Timeline: ${userPreferences.income_timeline || '6 months'}
Industries to Focus: ${userPreferences.industries_to_focus?.join(', ') || 'Any'}
Industries to Avoid: ${userPreferences.industries_to_avoid?.join(', ') || 'None'}

Based on current market trends and the user's profile, suggest 5 practical passive income ideas.

For each idea, provide:
1. Title (concise, catchy)
2. Description (2-3 sentences)
3. Category (one of: digital_products, ai_services, ecommerce, affiliate, education, software, investing, marketplace, automation, rental)
4. Why it fits their profile (brief explanation)
5. Difficulty (beginner, intermediate, advanced)
6. Estimated income range

Return as JSON with this structure:
{
  "ideas": [
    {
      "title": "string",
      "description": "string",
      "category": "string",
      "fit_explanation": "string",
      "difficulty": "string",
      "estimated_income": "string"
    }
  ],
  "summary": "Brief overview of why these ideas match the user's profile"
}`;

    const ideas = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          ideas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                category: { type: 'string' },
                fit_explanation: { type: 'string' },
                difficulty: { type: 'string' },
                estimated_income: { type: 'string' }
              }
            }
          },
          summary: { type: 'string' }
        }
      }
    });

    return Response.json(ideas);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});