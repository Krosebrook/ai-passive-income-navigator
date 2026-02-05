import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get portfolio forecast first
    const forecastResponse = await base44.functions.invoke('forecastPortfolioPerformance', { 
      timeframe: '12_months' 
    });
    const forecast = forecastResponse.data.forecast;

    if (!forecast || !forecast.rebalancing_recommendations) {
      return Response.json({ error: 'Unable to generate forecast' }, { status: 500 });
    }

    // Get current metrics
    const metricsResponse = await base44.functions.invoke('calculatePortfolioMetrics', {});
    const metrics = metricsResponse.data;

    // Generate high-priority alerts for immediate action
    const alerts = [];
    
    for (const rec of forecast.rebalancing_recommendations) {
      if (rec.priority === 'high') {
        await base44.entities.InvestmentAlert.create({
          title: `Rebalancing Opportunity: ${rec.target}`,
          description: rec.rationale,
          severity: 'high',
          alert_type: 'rebalancing_needed',
          affected_areas: [rec.target],
          recommended_action: `${rec.action} position by ${rec.percentage_change}%`,
          status: 'active',
          generated_at: new Date().toISOString()
        });

        alerts.push({
          target: rec.target,
          action: rec.action,
          timing: rec.optimal_timing
        });
      }
    }

    // Create comprehensive rebalancing suggestion
    const suggestion = await base44.entities.PortfolioAdjustmentSuggestion.create({
      user_email: user.email,
      overall_assessment: `Portfolio forecast: ${forecast.portfolio_forecast?.likely_value ? `$${forecast.portfolio_forecast.likely_value.toLocaleString()}` : 'analysis pending'}. ${forecast.rebalancing_recommendations.length} rebalancing actions recommended.`,
      recommendations: forecast.rebalancing_recommendations.map(rec => ({
        action: rec.action,
        category: rec.target,
        percentage: rec.percentage_change,
        rationale: rec.rationale,
        priority: rec.priority,
        timeline: rec.optimal_timing
      })),
      target_allocation: forecast.recommended_allocation || {},
      risk_analysis: {
        current_risk_level: 'moderate',
        recommended_risk_level: 'moderate',
        notes: forecast.risk_events?.join('; ') || 'Monitor market conditions'
      },
      market_context: forecast.market_context || 'Based on current market trends and predicted shifts',
      status: 'pending',
      generated_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      suggestion,
      alerts_created: alerts.length,
      forecast_summary: forecast.portfolio_forecast,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Predictive rebalancing error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to generate predictive rebalancing'
    }, { status: 500 });
  }
});