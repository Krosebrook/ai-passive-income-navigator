import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { checkRateLimit, validateContentLength, addSecurityHeaders } from './utils/validation.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Security checks
    checkRateLimit(user.email);
    validateContentLength(req);

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      return Response.json({ error: 'PERPLEXITY_API_KEY not configured' }, { status: 500 });
    }

    // Get user preferences
    const preferences = await base44.entities.UserPreferences.filter({ 
      user_email: user.email 
    });
    const userPrefs = preferences[0] || {};

    // Get latest market data for contextual suggestions
    const marketSnapshots = await base44.asServiceRole.entities.MarketDataSnapshot.list('-snapshot_date', 1);
    const latestMarket = marketSnapshots[0] || {};

    const actionsPrompt = `Based on this user's profile and current market conditions, suggest 5 specific, actionable next steps they should take RIGHT NOW on the platform.

User Profile:
- Goal: ${userPrefs.passive_income_goal || 'build passive income'}
- Risk: ${userPrefs.risk_tolerance || 'moderate'}
- Industries: ${userPrefs.target_industries?.join(', ') || 'open to suggestions'}
- Budget: $${userPrefs.investment_size_min || 0} - $${userPrefs.investment_size_max || 0}

Market Context:
- Sentiment: ${latestMarket.sentiment_score || 'neutral'}
- Hot Sectors: ${Object.keys(latestMarket.industry_data || {}).slice(0, 3).join(', ')}

For each action, provide:
- action_type: "alert" | "discover" | "analyze" | "learn" | "connect"
- title: Clear action title
- description: Why do this now (2 sentences max)
- button_text: CTA text
- route: Platform page to navigate to
- setup_params: Any parameters needed (e.g., industry for alert)
- urgency: "high" | "medium" | "low"
- estimated_time: "2 min" | "5 min" | "10 min"

Prioritize actions that:
1. Leverage current market opportunities
2. Match their risk profile
3. Can be completed quickly
4. Deliver immediate value

Return as JSON array of 5 actions.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{ role: 'user', content: actionsPrompt }],
        temperature: 0.3,
        max_tokens: 2000
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

    return Response.json({
      success: true,
      suggested_actions: actions,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Initial actions suggestion error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to suggest initial actions'
    }, { status: 500 });
  }
});