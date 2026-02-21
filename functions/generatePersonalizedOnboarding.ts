import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      return Response.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const { preferences } = await req.json();

    const onboardingPrompt = `You are an expert investment advisor creating a personalized onboarding experience. Based on these user preferences, generate:

User Profile:
- Investment Goal: ${preferences.passive_income_goal || 'N/A'}
- Risk Tolerance: ${preferences.risk_tolerance || 'moderate'}
- Time Commitment: ${preferences.time_commitment || 2} hours/week
- Target Industries: ${preferences.target_industries?.join(', ') || 'Not specified'}
- Investment Range: $${preferences.investment_size_min || 0} - $${preferences.investment_size_max || 0}
- Deal Structures: ${preferences.preferred_deal_structures?.join(', ') || 'Not specified'}
- Time Horizon: ${preferences.time_horizon || 'medium_term'}
- Skills: ${preferences.existing_skills?.join(', ') || 'None specified'}

Generate a personalized onboarding plan with:

1. **Welcome Message**: Personalized 2-3 sentence welcome that acknowledges their specific goals
2. **Learning Path**: 5 tutorial tips tailored to their profile, each with:
   - Title
   - Description
   - Why it matters for THEIR goals
   - Recommended action
3. **Quick Wins**: 3 immediate actions they can take today that align with their preferences
4. **Feature Priorities**: Which platform features they should focus on first and why
5. **Success Roadmap**: 3-month milestones based on their goals and time commitment
6. **Risk Guidance**: Specific advice for their risk tolerance level
7. **Industry Insights**: Brief insights about their target industries

Return as structured JSON.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: onboardingPrompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.content || data.content.length === 0) {
      throw new Error(`No content received from AI. Response: ${JSON.stringify(data)}`);
    }
    
    const content = data.content[0].text;
    
    let onboardingPlan = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        onboardingPlan = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Onboarding parsing error:', e);
      onboardingPlan = { raw_content: content, parsed: false };
    }

    return Response.json({
      success: true,
      onboarding_plan: onboardingPlan,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Personalized onboarding error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to generate personalized onboarding'
    }, { status: 500 });
  }
});