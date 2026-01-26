import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deal_id, founder_profile } = await req.json();
    
    if (!deal_id && !founder_profile) {
      return Response.json({ error: 'deal_id or founder_profile required' }, { status: 400 });
    }

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      return Response.json({ error: 'PERPLEXITY_API_KEY not configured' }, { status: 500 });
    }

    // Fetch deal if deal_id provided
    let dealData = null;
    let founderCriteria = founder_profile;
    
    if (deal_id) {
      const deals = await base44.entities.SourcedDealOpportunity.filter({ id: deal_id });
      if (deals.length === 0) {
        return Response.json({ error: 'Deal not found' }, { status: 404 });
      }
      dealData = deals[0];
      
      try {
        const parsed = JSON.parse(dealData.description);
        founderCriteria = parsed.founder_profile;
      } catch (e) {
        founderCriteria = { industry: dealData.industry };
      }
    }

    // Use Perplexity to search for matching founders
    const searchQuery = `Find 5 real potential founders or entrepreneurs who match this profile and could execute this opportunity:

    ${dealData ? `Deal: ${dealData.title}` : ''}
    ${dealData ? `Industry: ${dealData.industry}` : ''}
    
    Founder Criteria:
    ${JSON.stringify(founderCriteria, null, 2)}
    
    For each founder, provide:
    1. Name
    2. Current role/company
    3. Background (education, previous companies)
    4. Relevant experience
    5. Key achievements
    6. Why they're a match (specific reasons)
    7. LinkedIn profile URL (if publicly available)
    8. Contact info or how to reach them
    9. Match score (0-100%)
    
    Return as JSON array. Focus on real, identifiable people.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [{ role: 'user', content: searchQuery }],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let founders = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        founders = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Founder parsing error:', e);
      founders = [{ raw_content: content, match_score: 0 }];
    }

    // Store founder matches for future reference
    for (const founder of founders) {
      await base44.entities.FounderMatch.create({
        deal_id: deal_id || 'custom_search',
        founder_name: founder.name || 'Unknown',
        founder_profile: founder,
        match_score: founder.match_score || 70,
        status: 'identified',
        identified_at: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      founders,
      total_found: founders.length,
      searched_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Founder identification error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to identify potential founders'
    }, { status: 500 });
  }
});