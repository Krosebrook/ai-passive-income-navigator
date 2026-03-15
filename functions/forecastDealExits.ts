import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Forecasting module for in_progress deals.
 * Uses historical deal data + market trends to estimate exit horizons and ROI scenarios.
 * Provides hold/accelerate/divest recommendations.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { deal_id } = body;
    if (!deal_id) return Response.json({ error: 'deal_id required' }, { status: 400 });

    const deal = await base44.entities.DealPipeline.get(deal_id);
    if (!deal) return Response.json({ error: 'Deal not found' }, { status: 404 });

    // Fetch historical closed/completed pipeline deals for benchmarking
    const historicalDeals = await base44.entities.DealPipeline.filter({ stage: 'completed' });

    // Fetch market snapshot for context
    const marketSnapshots = await base44.entities.MarketDataSnapshot.list('-snapshot_date', 3);
    const latestMarket = marketSnapshots[0] || {};

    // Fetch investment strategy for user goals
    const strategies = await base44.entities.InvestmentStrategy.filter({ user_email: user.email });
    const strategy = strategies[0] || {};

    // Calculate time-in-pipeline
    const createdDate = new Date(deal.created_date);
    const daysInPipeline = Math.floor((Date.now() - createdDate.getTime()) / 86400000);

    // Historical benchmark stats
    const completedWithDates = historicalDeals.filter(d => d.stage_history && d.stage_history.length > 0);
    const avgCompletionDays = completedWithDates.length > 0
      ? completedWithDates.reduce((sum, d) => {
          const first = new Date(d.stage_history[0].entered_at);
          const last = new Date(d.stage_history[d.stage_history.length - 1].entered_at);
          return sum + Math.floor((last - first) / 86400000);
        }, 0) / completedWithDates.length
      : 90;

    const forecast = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a financial analyst and deal advisor. Generate a detailed exit forecast and ROI scenario analysis for this active investment deal.

DEAL DETAILS:
- Name: ${deal.deal_name}
- Description: ${deal.deal_description || 'N/A'}
- Current Stage: ${deal.stage}
- Priority: ${deal.priority}
- Estimated Value: $${deal.estimated_value || 0}
- Expected Close Date: ${deal.expected_close_date || 'Not set'}
- Progress: ${deal.progress_percentage || 0}%
- Days in Pipeline: ${daysInPipeline}
- Notes: ${deal.notes || 'None'}

HISTORICAL BENCHMARKS:
- Avg deal completion time (similar deals): ${Math.round(avgCompletionDays)} days
- Total completed deals in system: ${historicalDeals.length}

MARKET CONDITIONS:
- Market Sentiment Score: ${latestMarket.sentiment_score || 'N/A'}
- Volatility Index: ${latestMarket.volatility_index || 'N/A'}
- Key Industry Data: ${JSON.stringify(latestMarket.industry_data || {})}

USER STRATEGY:
- Direction: ${strategy.strategic_direction || 'Not defined'}

Based on all this information, provide:

1. THREE ROI scenarios (optimistic, base case, pessimistic) with:
   - Projected ROI percentage
   - Estimated exit timeline (in months)
   - Key assumptions
   - Probability of this scenario occurring (%)

2. Exit horizon analysis:
   - Estimated optimal exit window (date range)
   - Current deal velocity (on track / behind / ahead)
   - Projected completion date

3. AI Recommendation: Should the investor HOLD, ACCELERATE, or DIVEST?
   - Primary recommendation with confidence level
   - Specific reasoning
   - Action steps for recommended path

4. Key value drivers to watch

5. Risk factors that could impact the timeline

6. Milestone checklist: 3-5 specific actions to maximize outcome`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          roi_scenarios: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                scenario: { type: 'string', enum: ['optimistic', 'base_case', 'pessimistic'] },
                projected_roi_pct: { type: 'number' },
                exit_timeline_months: { type: 'number' },
                probability_pct: { type: 'number' },
                assumptions: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          exit_horizon: {
            type: 'object',
            properties: {
              optimal_window_start: { type: 'string' },
              optimal_window_end: { type: 'string' },
              projected_completion_date: { type: 'string' },
              deal_velocity: { type: 'string', enum: ['ahead', 'on_track', 'behind', 'stalled'] },
              velocity_notes: { type: 'string' }
            }
          },
          recommendation: {
            type: 'object',
            properties: {
              action: { type: 'string', enum: ['hold', 'accelerate', 'divest'] },
              confidence_level: { type: 'string', enum: ['high', 'medium', 'low'] },
              reasoning: { type: 'string' },
              action_steps: { type: 'array', items: { type: 'string' } }
            }
          },
          value_drivers: { type: 'array', items: { type: 'string' } },
          risk_factors: { type: 'array', items: { type: 'string' } },
          milestone_checklist: { type: 'array', items: { type: 'string' } },
          forecast_confidence: { type: 'number' },
          summary: { type: 'string' }
        }
      }
    });

    const forecastReport = {
      deal_id,
      deal_name: deal.deal_name,
      days_in_pipeline: daysInPipeline,
      ...forecast,
      generated_at: new Date().toISOString()
    };

    await base44.entities.DealPipeline.update(deal_id, {
      exit_forecast: forecastReport,
      exit_forecast_generated_at: new Date().toISOString(),
      recommended_action: forecast.recommendation?.action
    });

    return Response.json({ success: true, forecast: forecastReport });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});