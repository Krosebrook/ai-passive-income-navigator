import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userGoal, experience, timeCommitment } = await req.json();

    // Use AI to personalize onboarding flow
    const prompt = `You are an onboarding personalization AI for FlashFusion, a deal discovery platform.

**User Input:**
- Primary Goal: ${userGoal}
- Experience Level: ${experience}
- Time Commitment: ${timeCommitment}

Based on this, provide:
1. Personalized welcome message (2-3 sentences, friendly and encouraging)
2. Recommended focus areas (3-5 specific industries or deal types)
3. Suggested risk tolerance (very_conservative, conservative, moderate, aggressive, very_aggressive)
4. Recommended investment range (min and max in USD)
5. Key features to highlight in their tour (3 features)
6. First action recommendation (what they should do first)

Be specific and actionable. Match the tone to their experience level.`;

    const personalization = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          welcome_message: { type: 'string' },
          focus_areas: {
            type: 'array',
            items: { type: 'string' },
            description: 'Recommended industries or deal types'
          },
          risk_tolerance: {
            type: 'string',
            enum: ['very_conservative', 'conservative', 'moderate', 'aggressive', 'very_aggressive']
          },
          investment_range: {
            type: 'object',
            properties: {
              min: { type: 'number' },
              max: { type: 'number' }
            }
          },
          key_features: {
            type: 'array',
            items: { type: 'string' },
            description: 'Top 3 features to show'
          },
          first_action: { type: 'string' }
        },
        required: ['welcome_message', 'focus_areas', 'risk_tolerance', 'investment_range', 'key_features', 'first_action']
      }
    });

    // Create or update onboarding state
    const existingState = await base44.entities.OnboardingState.filter({
      created_by: user.email
    });

    if (existingState.length === 0) {
      await base44.entities.OnboardingState.create({
        user_email: user.email,
        started_at: new Date().toISOString(),
        entry_mode: 'standard',
        completed_steps: [{
          step_id: 'initial_input',
          completed_at: new Date().toISOString(),
          data_collected: { userGoal, experience, timeCommitment }
        }],
        activation_status: 'in_progress'
      });
    }

    return Response.json({
      success: true,
      personalization
    });

  } catch (error) {
    console.error('Personalization error:', error);
    return Response.json({ 
      error: error.message || 'Failed to personalize onboarding' 
    }, { status: 500 });
  }
});