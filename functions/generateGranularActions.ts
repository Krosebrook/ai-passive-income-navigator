import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { checkRateLimit, validateContentLength, addSecurityHeaders } from './utils/security.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    checkRateLimit(user.email);
    validateContentLength(req);

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      return Response.json({ error: 'PERPLEXITY_API_KEY not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { preferences, quiz_results, onboarding_stage } = body;

    // Get user preferences
    const userPrefs = preferences || {};
    
    // Get quiz performance to tailor actions
    const quizScore = quiz_results?.score || 0;
    const quizTotal = quiz_results?.total || 5;
    const knowledgeLevel = quizScore / quizTotal >= 0.8 ? 'advanced' : quizScore / quizTotal >= 0.5 ? 'intermediate' : 'beginner';

    const actionsPrompt = `Generate highly specific, actionable next steps for a user who just completed onboarding.

User Context:
- Goal: ${userPrefs.passive_income_goal || 'build passive income'}
- Risk: ${userPrefs.risk_tolerance || 'moderate'}
- Knowledge Level: ${knowledgeLevel} (scored ${quizScore}/${quizTotal} on quiz)
- Industries: ${userPrefs.target_industries?.join(', ') || 'open to suggestions'}
- Budget: $${userPrefs.investment_size_min || 0} - $${userPrefs.investment_size_max || 0}
- Time Available: ${userPrefs.time_commitment || 2} hours/week
- Current Stage: ${onboarding_stage || 'completed_basics'}

Generate 7 GRANULAR next actions that are:
1. Specific to their exact profile and knowledge gaps
2. Immediately actionable (can start in next 5 minutes)
3. Progressive - build on each other
4. Include both learning AND doing
5. Have clear success criteria

For each action:
- action_id: Unique identifier (e.g., "set_first_alert")
- title: Clear, action-oriented title (start with verb)
- description: What they'll accomplish and why it matters NOW (2 sentences)
- action_type: "learn" | "explore" | "configure" | "analyze" | "connect"
- route: Specific page/section to visit
- estimated_time: Realistic time in minutes
- difficulty: "easy" | "medium" | "challenging"
- prerequisites: Array of action_ids needed first (empty if none)
- success_metric: How they'll know they completed it
- next_recommended: action_id to do after this one

Prioritize based on their knowledge level:
- Beginner: More learning, simple configurations
- Intermediate: Mix of learning and hands-on exploration
- Advanced: Skip basics, focus on advanced features and analysis

Return as JSON array of 7 actions ordered by recommended sequence.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{ role: 'user', content: actionsPrompt }],
        temperature: 0.4,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let actions = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        actions = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Actions parsing error:', e);
    }

    const jsonResponse = Response.json({
      success: true,
      actions,
      knowledge_level: knowledgeLevel,
      generated_at: new Date().toISOString()
    });
    
    return addSecurityHeaders(jsonResponse);

  } catch (error) {
    console.error('Granular actions generation error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to generate granular actions'
    }, { status: 500 });
  }
});