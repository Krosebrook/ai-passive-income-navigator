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

    // Fetch unscored deals
    const deals = await base44.entities.SourcedDealOpportunity.filter({
      match_score: 0,
      source: 'api_sourced',
      status: 'pending'
    });

    if (deals.length === 0) {
      return Response.json({ success: true, message: 'No deals to score' });
    }

    // Fetch user preferences
    const preferences = await base44.entities.UserPreferences.filter({ 
      user_email: user.email 
    });
    const userPrefs = preferences[0] || {};

    const scoredDeals = [];

    for (const deal of deals.slice(0, 5)) { // Score 5 at a time
      const scoringQuery = `Analyze this investment opportunity and score it:

      Deal: ${deal.title}
      Industry: ${deal.industry}
      Description: ${deal.summary}
      
      User Preferences:
      - Industries: ${userPrefs.target_industries?.join(', ') || 'any'}
      - Investment Range: $${userPrefs.investment_size_min || 0} - $${userPrefs.investment_size_max || 1000000}
      - Risk Tolerance: ${userPrefs.risk_tolerance || 'moderate'}
      
      Provide:
      1. Match Score (0-100): How well it fits user preferences
      2. Risk Score (1-10): Investment risk level
      3. Predicted ROI (%): Expected return over 3 years
      4. Key Opportunities (3-4 bullets)
      5. Key Risks (3-4 bullets)
      6. Flag Priority: "high", "medium", or "low"
      7. One-line Summary
      8. Should Flag? (yes/no and why)
      
      Return as JSON.`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [{ role: 'user', content: scoringQuery }],
          temperature: 0.3,
          max_tokens: 1500
        })
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      let scoring = {};
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          scoring = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        scoring = { match_score: 50, risk_score: 5 };
      }

      // Update deal with scoring
      await base44.entities.SourcedDealOpportunity.update(deal.id, {
        match_score: scoring.match_score || 50,
        risk_score: scoring.risk_score || 5,
        predicted_roi: scoring.predicted_roi || 0,
        key_opportunities: scoring.key_opportunities || deal.key_opportunities,
        key_risks: scoring.key_risks || deal.key_risks,
        summary: scoring.summary || deal.summary,
        dd_viability_summary: scoring.should_flag || 'Requires review'
      });

      // Create alert for high-priority deals
      if (scoring.flag_priority === 'high' || scoring.match_score >= 80) {
        await base44.entities.InvestmentAlert.create({
          title: `High-Priority Deal: ${deal.title}`,
          description: scoring.summary || deal.summary,
          severity: 'high',
          alert_type: 'market_opportunity',
          affected_areas: [deal.industry],
          recommended_action: 'Review this deal for potential investment',
          status: 'active',
          generated_at: new Date().toISOString()
        });
      }

      scoredDeals.push({
        id: deal.id,
        title: deal.title,
        match_score: scoring.match_score,
        flag_priority: scoring.flag_priority
      });
    }

    return Response.json({
      success: true,
      deals_scored: scoredDeals.length,
      high_priority_count: scoredDeals.filter(d => d.flag_priority === 'high').length,
      scored_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Deal scoring error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to score deal opportunities'
    }, { status: 500 });
  }
});