import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { prompt, scenario_type } = await req.json();

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      return Response.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Generate realistic demo scenario using Gemini
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + GEMINI_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are FlashFusion AI, a passive income deal discovery platform. Generate a realistic, engaging demo scenario based on user input.

User input: "${prompt}"
Scenario type: ${scenario_type || 'deal_discovery'}

Generate a JSON response with:
{
  "deal": {
    "title": "specific deal opportunity",
    "industry": "industry name",
    "roi_projection": "percentage",
    "risk_score": 1-10,
    "time_to_profit": "timeframe",
    "initial_investment": "dollar amount",
    "key_highlights": ["3-4 bullet points"],
    "why_now": "timing insight",
    "ice_score": 1-100
  },
  "analysis": {
    "market_trend": "current trend insight",
    "competitive_advantage": "unique angle",
    "execution_path": ["step 1", "step 2", "step 3"],
    "risk_mitigation": "how to reduce risk"
  },
  "thought_process": "conversational explanation of why this is a good opportunity (2-3 sentences)"
}

Make it specific, actionable, and exciting. Use real-world market data when possible.`
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1500,
            responseMimeType: 'application/json'
          }
        })
      }
    );

    const data = await response.json();
    const result = JSON.parse(data.candidates[0].content.parts[0].text);

    return Response.json({
      success: true,
      scenario: result,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});