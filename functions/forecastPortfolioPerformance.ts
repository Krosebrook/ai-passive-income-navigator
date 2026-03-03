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
    const { horizon = '12_months', goals = {}, scenarios = ['bear', 'base', 'bull'] } = body;

    // Fetch user's investments and preferences
    const [investments, prefs, marketSnapshots] = await Promise.all([
      base44.entities.Investment.filter({ user_email: user.email }),
      base44.entities.UserPreferences.filter({ created_by: user.email }),
      base44.entities.MarketDataSnapshot.list('-snapshot_date', 1)
    ]);

    const userPrefs = prefs[0] || {};
    const latestMarket = marketSnapshots[0] || {};

    if (investments.length === 0) {
      return Response.json({
        success: true,
        message: 'no_investments',
        forecast: null
      });
    }

    // Aggregate portfolio summary
    const totalInvested = investments.reduce((s, i) => s + (i.initial_investment || 0), 0);
    const currentValue = investments.reduce((s, i) => s + (i.current_value || i.initial_investment || 0), 0);
    const byIndustry = {};
    investments.forEach(inv => {
      const ind = inv.industry || 'Other';
      if (!byIndustry[ind]) byIndustry[ind] = { invested: 0, current: 0, count: 0 };
      byIndustry[ind].invested += inv.initial_investment || 0;
      byIndustry[ind].current += inv.current_value || inv.initial_investment || 0;
      byIndustry[ind].count++;
    });

    const portfolioSummary = investments.map(inv => ({
      name: inv.investment_name,
      industry: inv.industry,
      asset_type: inv.asset_type,
      invested: inv.initial_investment,
      current_value: inv.current_value || inv.initial_investment,
      expected_roi: inv.expected_roi,
      actual_roi: inv.actual_roi,
      status: inv.status,
      investment_date: inv.investment_date
    }));

    const forecastPrompt = `You are an expert portfolio analyst. Generate a comprehensive financial forecast for this investor.

PORTFOLIO OVERVIEW:
- Total Invested: $${totalInvested.toLocaleString()}
- Current Value: $${currentValue.toLocaleString()}
- Overall ROI: ${totalInvested > 0 ? (((currentValue - totalInvested) / totalInvested) * 100).toFixed(1) : 0}%
- Number of Investments: ${investments.length}

INVESTMENTS:
${JSON.stringify(portfolioSummary, null, 2)}

INDUSTRY BREAKDOWN:
${JSON.stringify(byIndustry, null, 2)}

INVESTOR PROFILE:
- Risk Tolerance: ${userPrefs.risk_tolerance || 'moderate'}
- Time Horizon: ${userPrefs.time_horizon || 'medium_term'}
- Target Return: ${userPrefs.target_return_percentage ? userPrefs.target_return_percentage + '%' : 'Not specified'}
- Financial Goal: ${userPrefs.passive_income_goal || 'Not specified'}

MARKET CONTEXT:
- Market Sentiment Score: ${latestMarket.sentiment_score ?? 'N/A'}
- Volatility Index: ${latestMarket.volatility_index ?? 'N/A'}

FORECAST REQUEST:
- Horizon: ${horizon.replace('_', ' ')}
- Scenarios: ${scenarios.join(', ')}
- User Goals: ${JSON.stringify(goals)}

Generate a detailed financial forecast with these exact fields:

{
  "portfolio_health": {
    "score": 0-100,
    "rating": "excellent|good|fair|poor",
    "summary": "2-3 sentence overall health assessment",
    "strengths": ["..."],
    "weaknesses": ["..."]
  },
  "growth_projection": {
    "months": [1, 3, 6, 12],
    "bear": [values for each month],
    "base": [values for each month],
    "bull": [values for each month],
    "bear_roi": number,
    "base_roi": number,
    "bull_roi": number
  },
  "scenarios": [
    {
      "name": "Bear Case",
      "key": "bear",
      "description": "What drives this scenario",
      "projected_value": number,
      "projected_roi": number,
      "probability": "20%",
      "triggers": ["market events that cause this"]
    },
    {
      "name": "Base Case",
      "key": "base",
      "description": "...",
      "projected_value": number,
      "projected_roi": number,
      "probability": "60%",
      "triggers": ["..."]
    },
    {
      "name": "Bull Case",
      "key": "bull",
      "description": "...",
      "projected_value": number,
      "projected_roi": number,
      "probability": "20%",
      "triggers": ["..."]
    }
  ],
  "risk_factors": [
    {
      "factor": "name",
      "severity": "high|medium|low",
      "description": "...",
      "mitigation": "..."
    }
  ],
  "optimization_actions": [
    {
      "priority": "high|medium|low",
      "action": "Specific actionable recommendation",
      "expected_impact": "Projected improvement",
      "timeline": "When to act",
      "category": "rebalancing|diversification|exit|entry|tax"
    }
  ],
  "goal_alignment": {
    "on_track": true|false,
    "gap_analysis": "How far from goal",
    "required_monthly_return": number,
    "suggestions": ["..."]
  },
  "market_impact_summary": "How current market conditions affect this portfolio specifically"
}

Be precise with numbers. Base projections on the actual portfolio composition and realistic market expectations.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{ role: 'user', content: forecastPrompt }],
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

    let forecast = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        forecast = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Forecast parse error:', e);
      forecast = { raw_content: content, parsed: false };
    }

    // Persist the forecast
    await base44.asServiceRole.entities.FinancialPrediction.create({
      user_email: user.email,
      prediction_type: 'portfolio_forecast',
      horizon,
      forecast_data: forecast,
      portfolio_snapshot: {
        total_invested: totalInvested,
        current_value: currentValue,
        investment_count: investments.length
      },
      generated_at: new Date().toISOString()
    });

    const jsonResponse = Response.json({
      success: true,
      forecast,
      portfolio_meta: {
        total_invested: totalInvested,
        current_value: currentValue,
        investment_count: investments.length
      },
      generated_at: new Date().toISOString()
    });

    return addSecurityHeaders(jsonResponse);

  } catch (error) {
    console.error('Portfolio forecast error:', error);
    return Response.json({
      error: error.message,
      details: 'Failed to generate portfolio forecast'
    }, { status: 500 });
  }
});