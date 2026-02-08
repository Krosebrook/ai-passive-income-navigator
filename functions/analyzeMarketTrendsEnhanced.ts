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

    const { sectors } = await req.json();
    const targetSectors = sectors || ['technology', 'finance', 'healthcare', 'real estate'];

    // Comprehensive market analysis query
    const analysisQuery = `Provide comprehensive market analysis for investment decision-making:

    MACROECONOMIC FACTORS (current data):
    - Federal Reserve interest rate and recent policy changes
    - GDP growth rate and economic outlook
    - Inflation rate (CPI) and trends
    - Unemployment rate
    - Stock market indices performance (S&P 500, NASDAQ, Dow)
    - Bond yields and credit spreads
    - Currency strength (USD)
    
    SECTOR ANALYSIS for: ${targetSectors.join(', ')}
    For each sector provide:
    - Current performance and momentum
    - Key growth drivers
    - Major headwinds/risks
    - Valuation levels (overvalued/undervalued)
    - Top performing subsectors
    - Investment sentiment
    
    EMERGING TRENDS (next 6-12 months):
    - High-growth opportunities
    - Disruptive technologies/business models
    - Regulatory changes impacting investments
    - Geopolitical factors
    - Consumer behavior shifts
    
    RISK INDICATORS:
    - Market volatility (VIX level)
    - Credit market stress signals
    - Sector-specific risks
    - Recession probability
    
    Return as structured JSON with scores and actionable insights.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [{ role: 'user', content: analysisQuery }],
        temperature: 0.2,
        max_tokens: 4000
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let analysis = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Analysis parsing error:', e);
      analysis = { 
        raw_content: content,
        parsed: false 
      };
    }

    // Store market snapshot
    await base44.asServiceRole.entities.MarketDataSnapshot.create({
      snapshot_date: new Date().toISOString(),
      market_indices: analysis.macroeconomic?.indices || {},
      industry_data: analysis.sector_analysis || {},
      commodities: analysis.macroeconomic?.commodities || {},
      sentiment_score: analysis.risk_indicators?.market_sentiment || 0,
      volatility_index: analysis.risk_indicators?.vix || 0
    });

    return Response.json({
      success: true,
      analysis,
      analyzed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Market analysis error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to analyze market trends'
    }, { status: 500 });
  }
});