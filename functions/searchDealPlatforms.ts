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

    // Fetch user preferences
    const preferences = await base44.entities.UserPreferences.filter({ 
      user_email: user.email 
    });
    const userPrefs = preferences[0] || {};
    
    const industries = userPrefs.target_industries || ['technology', 'finance'];
    const investmentMin = userPrefs.investment_size_min || 10000;
    const investmentMax = userPrefs.investment_size_max || 500000;
    const dealStructures = userPrefs.preferred_deal_structures || ['equity', 'revenue_share'];

    // Search query for deal discovery
    const searchQuery = `Search recent startup investment opportunities, funding rounds, and deals from the past 30 days in these industries: ${industries.join(', ')}.

    Search criteria:
    - Investment range: $${investmentMin} - $${investmentMax}
    - Deal structures: ${dealStructures.join(', ')}
    - Include deals from: AngelList, Crunchbase, PitchBook, TechCrunch, industry news
    
    For each opportunity found, provide:
    1. Company/Deal Name
    2. Industry
    3. Brief Description (1-2 sentences)
    4. Funding Amount or Deal Size
    5. Deal Stage (seed, series A, etc.)
    6. Key Metrics (revenue, users, growth rate if available)
    7. Source URL
    8. Why it's noteworthy
    9. Initial Risk Indicators
    
    Find 10 most promising opportunities. Return as JSON array.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [{ role: 'user', content: searchQuery }],
        temperature: 0.2,
        max_tokens: 4000
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let discoveredDeals = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        discoveredDeals = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Deal parsing error:', e);
    }

    // Store discovered deals for scoring
    const storedDeals = [];
    for (const deal of discoveredDeals) {
      const stored = await base44.entities.SourcedDealOpportunity.create({
        title: deal.company_name || deal.name || 'Untitled Deal',
        industry: deal.industry || industries[0],
        summary: deal.description || 'Deal discovered from external sources',
        description: JSON.stringify(deal),
        estimated_value: deal.funding_amount || investmentMin,
        required_investment: Math.min(deal.funding_amount || investmentMin, investmentMax),
        source: 'api_sourced',
        source_url: deal.source_url,
        status: 'pending',
        is_generated: false,
        key_opportunities: [deal.why_noteworthy || 'Promising opportunity'],
        key_risks: deal.risk_indicators || ['Requires due diligence'],
        match_score: 0 // Will be scored separately
      });
      storedDeals.push(stored);
    }

    return Response.json({
      success: true,
      deals_found: discoveredDeals.length,
      deals_stored: storedDeals.length,
      discovered_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Deal search error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to search deal platforms'
    }, { status: 500 });
  }
});