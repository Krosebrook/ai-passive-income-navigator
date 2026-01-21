import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get comprehensive data for predictions
        const [deals, marketSnapshots, portfolioIdeas, performanceMetrics] = await Promise.all([
            base44.entities.DealPipeline.list(),
            base44.entities.MarketDataSnapshot.list('-created_date', 30),
            base44.entities.PortfolioIdea.list(),
            base44.entities.PerformanceMetric.list('-date', 90)
        ]);

        // Get user preferences
        const prefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
        const userPrefs = prefs[0] || {};

        // Calculate current metrics
        const totalDeals = deals.length;
        const closedDeals = deals.filter(d => d.stage === 'closed_won').length;
        const avgCycleTime = deals.filter(d => d.stage === 'closed_won').length > 0
            ? deals.filter(d => d.stage === 'closed_won').reduce((acc, d) => {
                const created = new Date(d.created_date);
                const updated = new Date(d.updated_date);
                return acc + (updated - created) / (1000 * 60 * 60 * 24);
            }, 0) / deals.filter(d => d.stage === 'closed_won').length
            : 0;

        const totalRevenue = performanceMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);
        const avgMonthlyRevenue = performanceMetrics.length > 0 
            ? totalRevenue / Math.ceil(performanceMetrics.length / 30)
            : 0;

        // Market sentiment trend
        const sentimentTrend = marketSnapshots.slice(0, 7).map(s => s.sentiment_score || 0);
        const avgSentiment = sentimentTrend.reduce((a, b) => a + b, 0) / sentimentTrend.length;

        // Generate comprehensive predictive insights
        const insightsPrompt = `
You are an AI financial advisor analyzing investment portfolio and deal pipeline performance.

CURRENT PORTFOLIO STATE:
- Total Deals in Pipeline: ${totalDeals}
- Closed Deals: ${closedDeals}
- Average Deal Cycle Time: ${avgCycleTime.toFixed(1)} days
- Total Revenue (90 days): $${totalRevenue.toLocaleString()}
- Average Monthly Revenue: $${avgMonthlyRevenue.toLocaleString()}
- Active Portfolio Ideas: ${portfolioIdeas.filter(i => i.status === 'in_progress').length}
- Launched Ideas: ${portfolioIdeas.filter(i => i.status === 'launched').length}

MARKET CONDITIONS:
- Recent Sentiment Trend (7 days): ${sentimentTrend.join(', ')}
- Average Market Sentiment: ${avgSentiment.toFixed(2)}
- Latest Volatility Index: ${marketSnapshots[0]?.volatility_index || 0}

USER PROFILE:
- Risk Tolerance: ${userPrefs.risk_tolerance || 'moderate'}
- Time Horizon: ${userPrefs.time_horizon || 'medium_term'}
- Target Return: ${userPrefs.target_return_percentage || 'not specified'}%

HISTORICAL PATTERNS:
- Deal Pipeline: ${JSON.stringify(deals.slice(0, 5).map(d => ({ stage: d.stage, value: d.estimated_value })))}
- Revenue Trend: ${JSON.stringify(performanceMetrics.slice(0, 10).map(m => ({ date: m.date, revenue: m.revenue })))}

Provide comprehensive predictive insights:

1. next_month_predictions:
   - expected_revenue (number): Predicted revenue for next month
   - expected_deals_closed (number): Predicted deals to close
   - confidence_interval (object): { low: number, high: number }

2. next_quarter_outlook:
   - revenue_forecast (number): 3-month revenue prediction
   - growth_trajectory (string): accelerating, stable, declining
   - key_drivers (array): Factors influencing this prediction

3. risk_predictions:
   - portfolio_risk_score (1-10): Overall risk level
   - market_risk_factors (array): Specific market risks
   - mitigation_recommendations (array): Actionable risk mitigation steps

4. opportunity_predictions:
   - emerging_opportunities (array): Opportunities to capitalize on
   - optimal_timing (object): When to make moves (e.g., { action: string, timeframe: string })
   - expected_roi_boost (number): Potential ROI improvement percentage

5. performance_milestones:
   - likely_milestones (array): Milestones expected to reach (with dates)
   - stretch_goals (array): Ambitious but achievable targets
   - warning_indicators (array): Early warning signs to watch

6. market_correlation_insights:
   - correlation_strength (string): strong, moderate, weak
   - key_correlations (array): How portfolio correlates with market
   - diversification_score (0-100): How well diversified

7. actionable_recommendations:
   - priority (string): high, medium, low
   - action (string): Specific action to take
   - expected_impact (string): What this will achieve
   - timing (string): When to execute

Return comprehensive JSON with all sections.`;

        const insights = await base44.integrations.Core.InvokeLLM({
            prompt: insightsPrompt,
            add_context_from_internet: true, // Get latest market data
            response_json_schema: {
                type: 'object',
                properties: {
                    next_month_predictions: {
                        type: 'object',
                        properties: {
                            expected_revenue: { type: 'number' },
                            expected_deals_closed: { type: 'number' },
                            confidence_interval: {
                                type: 'object',
                                properties: {
                                    low: { type: 'number' },
                                    high: { type: 'number' }
                                }
                            }
                        }
                    },
                    next_quarter_outlook: {
                        type: 'object',
                        properties: {
                            revenue_forecast: { type: 'number' },
                            growth_trajectory: { type: 'string' },
                            key_drivers: { type: 'array', items: { type: 'string' } }
                        }
                    },
                    risk_predictions: {
                        type: 'object',
                        properties: {
                            portfolio_risk_score: { type: 'number' },
                            market_risk_factors: { type: 'array', items: { type: 'string' } },
                            mitigation_recommendations: { type: 'array', items: { type: 'string' } }
                        }
                    },
                    opportunity_predictions: {
                        type: 'object',
                        properties: {
                            emerging_opportunities: { type: 'array', items: { type: 'string' } },
                            optimal_timing: {
                                type: 'object',
                                properties: {
                                    action: { type: 'string' },
                                    timeframe: { type: 'string' }
                                }
                            },
                            expected_roi_boost: { type: 'number' }
                        }
                    },
                    performance_milestones: {
                        type: 'object',
                        properties: {
                            likely_milestones: { type: 'array', items: { type: 'string' } },
                            stretch_goals: { type: 'array', items: { type: 'string' } },
                            warning_indicators: { type: 'array', items: { type: 'string' } }
                        }
                    },
                    market_correlation_insights: {
                        type: 'object',
                        properties: {
                            correlation_strength: { type: 'string' },
                            key_correlations: { type: 'array', items: { type: 'string' } },
                            diversification_score: { type: 'number' }
                        }
                    },
                    actionable_recommendations: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                priority: { type: 'string' },
                                action: { type: 'string' },
                                expected_impact: { type: 'string' },
                                timing: { type: 'string' }
                            }
                        }
                    }
                }
            }
        });

        return Response.json({
            success: true,
            generated_at: new Date().toISOString(),
            insights,
            data_points_analyzed: {
                deals: totalDeals,
                market_snapshots: marketSnapshots.length,
                portfolio_ideas: portfolioIdeas.length,
                performance_metrics: performanceMetrics.length
            }
        });

    } catch (error) {
        console.error('Error generating predictive insights:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});