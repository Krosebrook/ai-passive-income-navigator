import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { founder_name, founder_profile, deal_title, deal_summary, tone = 'professional' } = await req.json();
    
    if (!founder_name || !deal_title) {
      return Response.json({ error: 'founder_name and deal_title required' }, { status: 400 });
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      return Response.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const outreachPrompt = `Write a personalized outreach message to ${founder_name} about an investment opportunity.

    Founder Background: ${JSON.stringify(founder_profile, null, 2)}
    Deal: ${deal_title}
    Summary: ${deal_summary}
    
    Tone: ${tone}
    
    Requirements:
    - Personalize based on founder's background
    - Highlight why they're uniquely positioned for this
    - Be concise (150-200 words)
    - Include clear call-to-action
    - Professional but not overly formal
    - Reference specific achievements if available
    
    Format:
    1. Subject line
    2. Email body
    3. LinkedIn message (shorter version)
    
    Return as JSON with keys: subject, email, linkedin`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: outreachPrompt
        }]
      })
    });

    const data = await response.json();
    const content = data.content[0].text;
    
    let outreach = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        outreach = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      outreach = { raw_content: content };
    }

    return Response.json({
      success: true,
      outreach,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Outreach generation error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to generate founder outreach'
    }, { status: 500 });
  }
});