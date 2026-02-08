import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      return Response.json({ error: 'PERPLEXITY_API_KEY not configured' }, { status: 500 });
    }

    const { sector, depth = 'standard' } = await req.json();
    
    if (!sector) {
      return Response.json({ error: 'Sector parameter required' }, { status: 400 });
    }

    const sectorQuery = `Deep dive analysis of the ${sector} sector for investment opportunities:

    SECTOR HEALTH METRICS:
    - YTD performance vs broader market
    - Revenue growth trends (quarterly)
    - Profit margin trends
    - P/E ratios and valuation multiples
    - Insider buying/selling activity
    - Institutional ownership trends
    
    KEY DRIVERS & CATALYSTS:
    - Major news and developments (last 30 days)
    - Upcoming earnings reports and expectations
    - Product launches and innovations
    - M&A activity and deal flow
    - Regulatory approvals/changes
    
    COMPETITIVE LANDSCAPE:
    - Market leaders and disruptors
    - Competitive intensity
    - Barriers to entry
    - Technology disruptions
    
    INVESTMENT OPPORTUNITIES:
    - Undervalued companies/segments
    - High-growth subsectors
    - Contrarian plays
    - Risk-adjusted return potential
    
    RISK FACTORS:
    - Sector-specific headwinds
    - Competitive threats
    - Regulatory risks
    - Cyclical vulnerabilities
    
    FORWARD OUTLOOK (6-12 months):
    - Growth trajectory
    - Key milestones to watch
    - Recommended allocation percentage
    - Best deal structures for this sector
    
    Return detailed JSON with investment scores and recommendations.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [{ role: 'user', content: sectorQuery }],
        temperature: 0.2,
        max_tokens: 4000
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let sectorData = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        sectorData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      sectorData = { 
        raw_content: content,
        parsed: false 
      };
    }

    return Response.json({
      success: true,
      sector,
      data: sectorData,
      analyzed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sector analysis error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to analyze sector performance'
    }, { status: 500 });
  }
});