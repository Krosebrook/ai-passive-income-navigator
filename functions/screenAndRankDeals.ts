import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { checkRateLimit, validateContentLength, addSecurityHeaders } from './utils/security.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    checkRateLimit(user.email);
    validateContentLength(req);

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      return Response.json({ error: 'PERPLEXITY_API_KEY not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { criteria } = body;

    if (!criteria || typeof criteria !== 'object') {
      return Response.json({ error: 'Invalid criteria object' }, { status: 400 });
    }

    // Fetch candidate deals
    const allDeals = await base44.asServiceRole.entities.SourcedDealOpportunity.list('-created_date', 50);
    
    if (allDeals.length === 0) {
      return Response.json({ success: true, screened_deals: [], message: 'No deals available to screen' });
    }

    // Pre-filter deals by hard criteria before sending to AI (cheaper, faster)
    const candidates = allDeals.filter(deal => {
      const industryMatch = !criteria.target_industries?.length ||
        criteria.target_industries.some(ind => 
          (deal.industry || '').toLowerCase().includes(ind.toLowerCase())
        );
      const sizeMatch = !criteria.investment_size_max || 
        !deal.required_investment ||
        deal.required_investment <= criteria.investment_size_max;
      const structureMatch = !criteria.preferred_deal_structures?.length ||
        criteria.preferred_deal_structures.some(s =>
          (deal.deal_structure || '').toLowerCase().includes(s.toLowerCase())
        );
      return industryMatch && sizeMatch && structureMatch;
    });

    // Cap at 20 for AI analysis
    const dealsForAI = candidates.slice(0, 20);

    const dealSummaries = dealsForAI.map((deal, idx) => ({
      index: idx,
      id: deal.id,
      title: deal.title,
      industry: deal.industry || 'Unknown',
      summary: deal.summary?.slice(0, 300),
      estimated_roi: deal.estimated_roi || deal.predicted_roi,
      risk_score: deal.risk_score || deal.predicted_risk_score,
      required_investment: deal.required_investment,
      deal_structure: deal.deal_structure || 'Not specified',
      time_to_roi: deal.time_to_roi,
      estimated_value: deal.estimated_value
    }));

    const riskMap = {
      very_conservative: 'Risk score must be 1-3. Any score above 4 is disqualifying.',
      conservative: 'Risk score must be 1-4. Scores above 6 are strongly penalized.',
      moderate: 'Risk score up to 6 is acceptable. Prefer balanced risk/reward.',
      aggressive: 'Risk scores up to 8 are fine. Prioritize high ROI potential.',
      very_aggressive: 'Risk score is not a penalty. Maximize ROI potential above all else.'
    };

    const screeningPrompt = `You are an expert investment screener. Evaluate each deal against the investor's criteria and rank them.

INVESTOR CRITERIA:
- Target Industries: ${criteria.target_industries?.join(', ') || 'Any'}
- Investment Size Range: $${criteria.investment_size_min?.toLocaleString() || 0} - $${criteria.investment_size_max?.toLocaleString() || 'Unlimited'}
- Preferred Deal Structures: ${criteria.preferred_deal_structures?.join(', ') || 'Any'}
- Risk Tolerance: ${criteria.risk_tolerance || 'moderate'} — ${riskMap[criteria.risk_tolerance] || 'Balanced approach.'}
- Time Horizon: ${criteria.time_horizon || 'medium_term'}
- Target Annual Return: ${criteria.target_return_percentage ? criteria.target_return_percentage + '%' : 'Not specified'}

DEALS TO EVALUATE:
${JSON.stringify(dealSummaries, null, 2)}

For EACH deal, produce:
- index: (same index from input)
- fit_score: 0-100 (how well it matches the criteria)
- fit_rating: "excellent" | "good" | "fair" | "poor"
- fit_summary: 2-3 sentence explanation of overall fit
- match_reasons: array of 2-4 specific reasons it matches the criteria
- concerns: array of 1-3 specific concerns or mismatches (empty array if none)
- recommendation: "strong_buy" | "consider" | "pass" | "avoid"

Rank them by fit_score descending. Be specific and direct — reference actual deal data.

Return ONLY a JSON array (no extra text):
[
  {
    "index": 0,
    "fit_score": 87,
    "fit_rating": "excellent",
    "fit_summary": "...",
    "match_reasons": ["...", "..."],
    "concerns": ["..."],
    "recommendation": "consider"
  }
]`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{ role: 'user', content: screeningPrompt }],
        temperature: 0.2,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let screeningResults = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        screeningResults = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Screening parse error:', e);
    }

    // Merge AI results back with full deal data
    const screened = screeningResults.map(result => {
      const deal = dealsForAI[result.index];
      if (!deal) return null;
      return {
        ...deal,
        fit_score: result.fit_score,
        fit_rating: result.fit_rating,
        fit_summary: result.fit_summary,
        match_reasons: result.match_reasons || [],
        concerns: result.concerns || [],
        recommendation: result.recommendation
      };
    }).filter(Boolean);

    const jsonResponse = Response.json({
      success: true,
      screened_deals: screened,
      total_candidates: candidates.length,
      total_analyzed: dealsForAI.length,
      generated_at: new Date().toISOString()
    });

    return addSecurityHeaders(jsonResponse);

  } catch (error) {
    console.error('Deal screening error:', error);
    return Response.json({
      error: error.message,
      details: 'Failed to screen and rank deals'
    }, { status: 500 });
  }
});