import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deal_id } = await req.json();
    
    if (!deal_id) {
      return Response.json({ error: 'deal_id required' }, { status: 400 });
    }

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      return Response.json({ error: 'PERPLEXITY_API_KEY not configured' }, { status: 500 });
    }

    // Fetch the deal
    const deals = await base44.entities.SourcedDealOpportunity.filter({ id: deal_id });
    if (deals.length === 0) {
      return Response.json({ error: 'Deal not found' }, { status: 404 });
    }
    const deal = deals[0];

    const structureQuery = `Analyze this investment opportunity and generate 4 different deal structure variations:

    Deal: ${deal.title}
    Industry: ${deal.industry}
    Summary: ${deal.summary}
    Required Investment: $${deal.required_investment || 100000}
    
    Generate these structures:
    1. Equity Investment
    2. Convertible Note
    3. SAFE (Simple Agreement for Future Equity)
    4. Revenue Share Agreement
    
    For EACH structure, provide:
    - Key Terms (e.g., equity %, interest rate, valuation cap, discount rate, revenue %)
    - Investment Amount
    - Predicted ROI (%) over 3 years
    - Risk Score (1-10, where 10 is highest risk)
    - Time to Liquidity (months)
    - Pros (3-4 bullet points)
    - Cons (3-4 bullet points)
    - Best For (investor profile)
    - Exit Scenarios (how investor gets paid)
    - Downside Protection (what happens if deal fails)
    
    Return as JSON array of 4 structure objects.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [{ role: 'user', content: structureQuery }],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let structures = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        structures = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Structure parsing error:', e);
      structures = [];
    }

    // Store structures for the deal
    await base44.entities.SourcedDealOpportunity.update(deal_id, {
      deal_structure_variations: structures,
      structures_generated_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      structures,
      deal_id,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Deal structure generation error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to generate deal structure variations'
    }, { status: 500 });
  }
});