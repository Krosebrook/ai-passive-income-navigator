import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generates personalized AI roadmap for a passive income idea
 * Tailored to user's skills, resources, time availability, and risk tolerance
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { portfolioIdeaId, ideaTitle, ideaDescription, userProfile } = await req.json();

    // Input validation
    if (!portfolioIdeaId || !ideaTitle || !userProfile) {
      return Response.json({ 
        error: 'Missing required fields: portfolioIdeaId, ideaTitle, userProfile' 
      }, { status: 400 });
    }

    const prompt = `Create a personalized, step-by-step action plan for launching this passive income idea:

Idea: ${ideaTitle}
Description: ${ideaDescription || 'No description provided'}

User Profile:
- Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
- Available Time: ${userProfile.available_hours_weekly || 10} hours/week
- Budget: $${userProfile.budget || 1000}
- Risk Tolerance: ${userProfile.risk_tolerance || 'medium'}
- Experience Level: ${userProfile.experience_level || 'beginner'}

Generate a realistic, actionable roadmap divided into phases. Each phase should:
1. Have clear objectives and success criteria
2. Include specific action steps with time and cost estimates
3. Be tailored to the user's available time and budget
4. Account for their skill level and risk tolerance
5. Identify tools/resources needed
6. Include milestones to track progress

Return JSON with structure:
{
  "phases": [
    {
      "phase_number": 1,
      "phase_name": "Foundation & Setup",
      "duration_weeks": 2,
      "objectives": ["objective1", "objective2"],
      "action_steps": [
        {
          "step": "detailed action item",
          "estimated_hours": 5,
          "tools_needed": ["tool1", "tool2"],
          "cost_estimate": 50,
          "priority": "high|medium|low",
          "completed": false
        }
      ],
      "milestones": ["milestone1", "milestone2"],
      "success_criteria": ["criteria1", "criteria2"]
    }
  ],
  "total_timeline_weeks": 12,
  "estimated_total_investment": 2500,
  "key_risks": [
    {
      "risk": "potential risk",
      "mitigation": "how to mitigate"
    }
  ]
}

Make it realistic and achievable based on the user's constraints.`;

    const roadmap = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          phases: {
            type: 'array',
            items: { type: 'object' }
          },
          total_timeline_weeks: { type: 'number' },
          estimated_total_investment: { type: 'number' },
          key_risks: {
            type: 'array',
            items: { type: 'object' }
          }
        }
      }
    });

    // Save to database
    const savedRoadmap = await base44.entities.PersonalizedRoadmap.create({
      portfolio_idea_id: portfolioIdeaId,
      idea_title: ideaTitle,
      user_profile: userProfile,
      ...roadmap,
      progress_percentage: 0,
      last_updated: new Date().toISOString()
    });

    return Response.json(savedRoadmap);
  } catch (error) {
    console.error('Roadmap generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});