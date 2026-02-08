import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { timeframe = '12_months' } = await req.json();

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      return Response.json({ error: 'PERPLEXITY_API_KEY not configured' }, { status: 500 });
    }

    // Fetch current investments
    const investments = await base44.entities.Investment.filter({ user_email: user.email });
    
    if (investments.length === 0) {
      return Response.json({ success: true, forecasts: [], message: 'No investments to forecast' });
    }

    // Get macroeconomic context
    const marketSnapshots = await base44.asServiceRole.entities.MarketDataSnapshot.list('-snapshot_date', 1);
    const latestMarket = marketSnapshots[0] || {};

    // Aggregate by industry for market context
    const byIndustry = {};
    investments.forEach(inv => {
      const industry = inv.industry || 'Other';
      byIndustry[industry] = (byIndustry[industry] || 0) + 1;
    });

    // Generate portfolio-wide forecast with macro context
    const forecastQuery = `As a financial analyst, forecast the ${timeframe.replace('_', ' ')} performance of this investment portfolio:

    Total Investments: ${investments.length}
    Industries: ${Object.keys(byIndustry).join(', ')}
    Current Total Value: $${investments.reduce((sum, inv) => sum + (inv.current_value || inv.initial_investment || 0), 0)}
    Current ROI: ${investments.reduce((sum, inv) => sum + (inv.actual_roi || 0), 0) / investments.length}%
    
    Current Market Context:
    - Market Volatility: ${latestMarket.volatility_index || 'N/A'}
    - Market Sentiment: ${latestMarket.sentiment_score || 'neutral'}
    - Sector Performance: ${JSON.stringify(latestMarket.industry_data || {})}
    - Consider: interest rates, inflation, GDP growth, sector rotation, regulatory changes
    
    Analyze:
    1. Market trends affecting each industry
    2. Economic factors and headwinds
    3. Predicted performance for each investment
    4. Overall portfolio value projection (best case, likely, worst case)
    5. Industries likely to outperform/underperform
    6. Recommended rebalancing actions with priority
    7. Risk events to monitor
    
    Return as JSON with structure:
    {
      "portfolio_forecast": {
        "best_case_value": number,
        "likely_value": number,
        "worst_case_value": number,
        "confidence": number
      },
      "individual_forecasts": [
        {
          "investment_name": string,
          "predicted_value_change_percent": number,
          "confidence": number,
          "key_factors": [string]
        }
      ],
      "rebalancing_recommendations": [
        {
          "action": "reduce|increase|hold",
          "target": string,
          "percentage_change": number,
          "priority": "high|medium|low",
          "rationale": string,
          "optimal_timing": string
        }
      ],
      "risk_events": [string]
    }`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [{ role: 'user', content: forecastQuery }],
        temperature: 0.3,
        max_tokens: 3000
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let forecast = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        forecast = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Forecast parsing error:', e);
      forecast = { raw_content: content };
    }

    // Store forecast for future reference
    await base44.entities.FinancialPrediction.create({
      user_email: user.email,
      prediction_type: 'portfolio_forecast',
      timeframe,
      prediction_data: forecast,
      confidence_score: forecast.portfolio_forecast?.confidence || 70,
      status: 'active'
    });

    return Response.json({
      success: true,
      forecast,
      investments_analyzed: investments.length,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Portfolio forecast error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to forecast portfolio performance'
    }, { status: 500 });
  }
});