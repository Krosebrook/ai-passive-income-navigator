import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Matchmaker Engine - cross-references incoming deal opportunities against
 * user investment criteria, portfolio risk profile, and industry preferences.
 * Flags best high-potential candidates.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { deal_ids } = body; // optional: specific deals to analyze, else analyze all pending

    // Fetch user preferences
    const prefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
    const userPref = prefs[0] || {};

    // Fetch user's existing portfolio (accepted/in_progress deals)
    const portfolioDeals = await base44.entities.SourcedDealOpportunity.filter({
      status: 'in_progress'
    });

    // Fetch deals to evaluate
    let dealsToAnalyze;
    if (deal_ids && deal_ids.length > 0) {
      dealsToAnalyze = await Promise.all(
        deal_ids.map(id => base44.entities.SourcedDealOpportunity.get(id))
      );
    } else {
      dealsToAnalyze = await base44.entities.SourcedDealOpportunity.filter({ status: 'pending' });
    }

    if (!dealsToAnalyze.length) {
      return Response.json({ success: true, matches: [], message: 'No deals to evaluate' });
    }

    // Build portfolio risk profile from existing investments
    const portfolioIndustries = portfolioDeals.map(d => d.industry).filter(Boolean);
    const industryConcentration = portfolioIndustries.reduce((acc, ind) => {
      acc[ind] = (acc[ind] || 0) + 1;
      return acc;
    }, {});

    const avgRisk = portfolioDeals.length
      ? portfolioDeals.reduce((s, d) => s + (d.risk_score || 5), 0) / portfolioDeals.length
      : 5;

    // Run AI matchmaking for all deals in one call for efficiency
    const matchmakerResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert investment matchmaker. Evaluate each deal opportunity against the investor's profile and return match scores with reasoning.

INVESTOR PROFILE:
- Risk Tolerance: ${userPref.risk_tolerance || 'moderate'}
- Target Industries: ${JSON.stringify(userPref.target_industries || [])}
- Investment Size Range: $${userPref.investment_size_min || 0} - $${userPref.investment_size_max || 'unlimited'}
- Preferred Deal Structures: ${JSON.stringify(userPref.preferred_deal_structures || [])}
- Time Horizon: ${userPref.time_horizon || 'medium_term'}
- Target Return: ${userPref.target_return_percentage || 20}%
- Passive Income Goal: ${userPref.passive_income_goal || 'supplement'}

PORTFOLIO RISK PROFILE:
- Current avg risk score: ${avgRisk.toFixed(1)}/10
- Industry concentration: ${JSON.stringify(industryConcentration)}
- Total active deals: ${portfolioDeals.length}

DEALS TO EVALUATE:
${dealsToAnalyze.map((d, i) => `
Deal ${i + 1} (ID: ${d.id}):
  Name: ${d.title}
  Industry: ${d.industry}
  Estimated ROI: ${d.estimated_roi || d.predicted_roi || 'N/A'}%
  Risk Score: ${d.risk_score || 'N/A'}/10
  Investment Required: $${d.required_investment || d.estimated_value || 0}
  Deal Structure: ${d.deal_structure || 'N/A'}
  Summary: ${d.summary || ''}
`).join('\n')}

For each deal, provide:
1. A match_score (0-100) based on alignment with investor profile
2. A fit_rating: "excellent", "good", "fair", or "poor"
3. Primary match reasons (top 3)
4. Risk alignment assessment
5. Portfolio diversification impact (positive/neutral/negative)
6. Whether it should be flagged as high-potential (true/false)
7. A brief recommendation message

Flag deals as high-potential if they score 75+ AND offer meaningful portfolio diversification or exceptional ROI potential.`,
      response_json_schema: {
        type: 'object',
        properties: {
          evaluations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                deal_id: { type: 'string' },
                match_score: { type: 'number' },
                fit_rating: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor'] },
                match_reasons: { type: 'array', items: { type: 'string' } },
                risk_alignment: { type: 'string' },
                diversification_impact: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
                is_high_potential: { type: 'boolean' },
                recommendation_message: { type: 'string' },
                concerns: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          market_summary: { type: 'string' },
          top_pick_id: { type: 'string' }
        }
      }
    });

    const evaluations = matchmakerResult.evaluations || [];

    // Update each deal with matchmaker results
    const updatePromises = evaluations.map(async (ev) => {
      const deal = dealsToAnalyze.find(d => d.id === ev.deal_id);
      if (!deal) return;

      await base44.entities.SourcedDealOpportunity.update(ev.deal_id, {
        matchmaker_score: ev.match_score,
        matchmaker_fit_rating: ev.fit_rating,
        matchmaker_reasons: ev.match_reasons,
        matchmaker_risk_alignment: ev.risk_alignment,
        matchmaker_diversification_impact: ev.diversification_impact,
        matchmaker_high_potential: ev.is_high_potential,
        matchmaker_recommendation: ev.recommendation_message,
        matchmaker_concerns: ev.concerns,
        matchmaker_run_at: new Date().toISOString(),
        match_score: ev.match_score // also update base match score
      });
    });

    await Promise.all(updatePromises);

    const highPotentialDeals = evaluations.filter(ev => ev.is_high_potential);

    return Response.json({
      success: true,
      total_evaluated: evaluations.length,
      high_potential_count: highPotentialDeals.length,
      top_pick_id: matchmakerResult.top_pick_id,
      market_summary: matchmakerResult.market_summary,
      matches: evaluations
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});