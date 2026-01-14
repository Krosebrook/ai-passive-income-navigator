import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { preferences, currentPortfolio, bookmarkedIdeas } = await req.json();

    const prompt = `Generate personalized passive income recommendations based on user profile:

User Preferences:
- Goals: ${preferences?.passive_income_goal || 'General passive income'}
- Risk Tolerance: ${preferences?.risk_tolerance || '3/5'}
- Time Commitment: ${preferences?.time_commitment || '3/5'} hours per week
- Target Monthly Income: $${preferences?.target_monthly_income || '1000'}
- Timeline: ${preferences?.income_timeline || '6 months'}
- Budget: $${preferences?.max_upfront_investment || '500'}
- Interests: ${preferences?.interests?.join(', ') || 'Various'}
- Skills: ${preferences?.existing_skills?.join(', ') || 'General'}
- Tech Comfort: ${preferences?.tech_comfort_level || '3/5'}

Current Portfolio (${currentPortfolio?.length || 0} ideas):
${currentPortfolio?.map(i => \`- \${i.title} (\${i.status})\`).join('\\n') || 'None yet'}

Bookmarked Ideas (${bookmarkedIdeas?.length || 0}):
${bookmarkedIdeas?.slice(0, 5).map(b => \`- \${b.idea_title}\`).join('\\n') || 'None'}

Analyze the user's profile and recommend 5-7 specific passive income ideas that:
1. Match their constraints (budget, time, timeline, risk tolerance)
2. Complement their existing portfolio
3. Leverage their existing skills
4. Align with stated interests
5. Have realistic ROI within their timeline

Return JSON with structure:
{
  "recommendations": [
    {
      "idea_name": "string",
      "description": "string",
      "why_recommended": "string (explain how it matches their profile)",
      "fit_score": number (1-100),
      "difficulty": "beginner|intermediate|advanced",
      "time_commitment": "string (e.g., '5 hours/week')",
      "startup_cost": "string",
      "estimated_roi": "string (e.g., '$500-1000/month')",
      "timeline_to_profit": "string",
      "skills_needed": ["skill1", "skill2"],
      "next_steps": ["step1", "step2"]
    }
  ],
  "portfolio_gaps": ["gap1", "gap2"],
  "strengths": ["strength1", "strength2"],
  "opportunities": ["opp1", "opp2"],
  "personalization_summary": "string"
}`;

    const recommendations = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: { type: 'array', items: { type: 'object' } },
          portfolio_gaps: { type: 'array', items: { type: 'string' } },
          strengths: { type: 'array', items: { type: 'string' } },
          opportunities: { type: 'array', items: { type: 'string' } },
          personalization_summary: { type: 'string' }
        }
      }
    });

    return Response.json(recommendations);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});