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

    // Get latest market intelligence
    const marketSnapshots = await base44.asServiceRole.entities.MarketDataSnapshot.list('-snapshot_date', 1);
    const latestMarket = marketSnapshots[0] || {};
    
    const industries = userPrefs.target_industries || ['technology', 'finance'];
    const investmentMin = userPrefs.investment_size_min || 10000;
    const investmentMax = userPrefs.investment_size_max || 500000;
    const riskTolerance = userPrefs.risk_tolerance || 'moderate';

    // Step 1: Identify underserved markets
    const marketGapQuery = `As a venture analyst, identify 3 UNDERSERVED markets or business opportunities that currently lack solutions or have poor existing solutions.

    Focus areas: ${industries.join(', ')}
    Investment range: $${investmentMin} - $${investmentMax}
    Risk tolerance: ${riskTolerance}
    
    For each opportunity, analyze:
    1. Market gap description (what's missing?)
    2. Current pain points (what are people struggling with?)
    3. Market size estimate
    4. Why this gap exists (barriers, timing, technology limitations)
    5. Potential business models to fill this gap
    6. Required investment to launch
    7. Estimated time to profitability
    8. Competitive advantages of being first
    
    Return as JSON array.`;

    const marketResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [{ role: 'user', content: marketGapQuery }],
        temperature: 0.4,
        max_tokens: 4000
      })
    });

    const marketData = await marketResponse.json();
    const marketContent = marketData.choices[0].message.content;
    
    let marketGaps = [];
    try {
      const jsonMatch = marketContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) marketGaps = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Market gap parsing error:', e);
    }

    // Step 2: For each gap, generate a complete deal structure
    const originatedDeals = [];
    
    for (const gap of marketGaps.slice(0, 3)) {
      const dealStructureQuery = `Create a complete investable deal structure for this opportunity:

      Market Gap: ${gap.market_gap_description || gap.description}
      Business Model: ${gap.potential_business_models || gap.business_model}
      
      Generate:
      1. Deal Title (compelling, specific)
      2. Executive Summary (2-3 sentences)
      3. Business Model Details (revenue streams, unit economics)
      4. Go-to-Market Strategy (first 90 days)
      5. Financial Projections (Year 1-3: revenue, costs, profit)
      6. Team Requirements (key roles needed)
      7. Founder Profile (ideal background and skills)
      8. Investment Structure:
         - Amount needed: $${gap.required_investment || investmentMin}
         - Equity offered: X%
         - Use of funds breakdown
         - Expected ROI: X% over Y years
         - Exit strategy
      9. Risk Mitigation Plan
      10. Key Milestones (0-12 months)
      11. Success Metrics (KPIs to track)
      
      Return as JSON.`;

      const dealResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [{ role: 'user', content: dealStructureQuery }],
          temperature: 0.3,
          max_tokens: 3000
        })
      });

      const dealData = await dealResponse.json();
      const dealContent = dealData.choices[0].message.content;
      
      let dealStructure = {};
      try {
        const jsonMatch = dealContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) dealStructure = JSON.parse(jsonMatch[0]);
      } catch (e) {
        dealStructure = { raw_content: dealContent };
      }

      // Step 3: Find potential founders (simulate LinkedIn/AngelList search)
      const founderQuery = `Identify ideal founder profile and suggest how to find them for: ${dealStructure.deal_title || 'this opportunity'}
      
      Provide:
      1. Ideal founder background (education, experience)
      2. Key skills required
      3. Personality traits for success
      4. Where to find them (platforms, communities, events)
      5. Red flags to avoid
      
      Return as JSON.`;

      const founderResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [{ role: 'user', content: founderQuery }],
          temperature: 0.3,
          max_tokens: 1500
        })
      });

      const founderData = await founderResponse.json();
      const founderContent = founderData.choices[0].message.content;
      
      let founderProfile = {};
      try {
        const jsonMatch = founderContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) founderProfile = JSON.parse(jsonMatch[0]);
      } catch (e) {
        founderProfile = { raw_content: founderContent };
      }

      // Create originated deal
      const originatedDeal = await base44.entities.SourcedDealOpportunity.create({
        title: dealStructure.deal_title || gap.market_gap_description || 'AI-Originated Opportunity',
        industry: industries[0] || 'Technology',
        summary: dealStructure.executive_summary || gap.market_gap_description || 'Market gap opportunity',
        description: JSON.stringify({
          market_gap: gap,
          deal_structure: dealStructure,
          founder_profile: founderProfile,
          origination_date: new Date().toISOString()
        }),
        estimated_value: gap.market_size || investmentMax,
        required_investment: gap.required_investment || investmentMin,
        estimated_roi: 150, // AI-originated deals target 150% ROI
        time_to_roi: dealStructure.time_to_profitability || '18-24 months',
        risk_score: riskTolerance === 'aggressive' ? 7 : riskTolerance === 'conservative' ? 3 : 5,
        match_score: 85, // High match since originated for user
        key_opportunities: [
          'First-mover advantage in underserved market',
          'Clear path to profitability',
          'Strong unit economics',
          'Scalable business model'
        ],
        key_risks: [
          'Need to find right founder',
          'Market validation required',
          'Execution risk'
        ],
        source: 'ai_generated',
        is_generated: true,
        status: 'pending',
        how_to_pursue: `1. Validate market gap through customer interviews\n2. Find ideal founder matching profile\n3. Develop MVP\n4. Test go-to-market strategy\n5. Scale based on metrics`,
        deal_structure: dealStructure.investment_structure || 'Equity investment',
        dd_actionable_steps: dealStructure.key_milestones || [],
        dd_viability_summary: `AI-originated opportunity addressing ${gap.market_gap_description}. Market size: ${gap.market_size}. Requires finding ideal founder and validating market assumptions.`
      });

      originatedDeals.push(originatedDeal);
    }

    // Award points for deal origination
    await base44.functions.invoke('awardPoints', {
      user_email: user.email,
      event_type: 'deal_sourced',
      points: originatedDeals.length * 100,
      description: `AI originated ${originatedDeals.length} new deal(s)`
    });

    return Response.json({
      success: true,
      originated_deals: originatedDeals,
      market_gaps_analyzed: marketGaps.length,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Deal origination error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to originate new deals'
    }, { status: 500 });
  }
});