import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ideaTitle, currentRevenue, currentExpenses, growthRate, marketData } = await req.json();

    const prompt = `Generate detailed 12-month financial projections for this passive income idea:

Title: ${ideaTitle}
Current Monthly Revenue: $${currentRevenue || 0}
Current Monthly Expenses: $${currentExpenses || 0}
Estimated Growth Rate: ${growthRate || '10%'} monthly
Market Context: ${marketData || 'General passive income market'}

Provide month-by-month projections including:
1. Revenue forecasts (conservative, moderate, optimistic scenarios)
2. Expense projections (variable and fixed costs)
3. Profit margin trends
4. Break-even analysis
5. ROI timeline
6. Key milestones and inflection points
7. Risk factors and sensitivity analysis
8. Scaling recommendations

Return JSON with structure:
{
  "summary": {
    "break_even_month": number,
    "year_end_revenue": {
      "conservative": number,
      "moderate": number,
      "optimistic": number
    },
    "expected_roi_percentage": number,
    "profitability_timeline": "string"
  },
  "monthly_projections": [
    {
      "month": number,
      "revenue_conservative": number,
      "revenue_moderate": number,
      "revenue_optimistic": number,
      "expenses": number,
      "profit_moderate": number,
      "roi_percentage": number,
      "notes": "string"
    }
  ],
  "scaling_costs": [
    {
      "category": "string",
      "current_cost": number,
      "projected_cost_6mo": number,
      "projected_cost_12mo": number
    }
  ],
  "risk_factors": [
    {
      "risk": "string",
      "impact": "low|medium|high",
      "mitigation": "string"
    }
  ],
  "key_milestones": [
    {
      "month": number,
      "milestone": "string",
      "expected_impact": "string"
    }
  ],
  "sensitivity_analysis": {
    "if_revenue_10_percent_lower": "string",
    "if_expenses_20_percent_higher": "string",
    "if_growth_doubles": "string"
  }
}`;

    const projections = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'object' },
          monthly_projections: { type: 'array', items: { type: 'object' } },
          scaling_costs: { type: 'array', items: { type: 'object' } },
          risk_factors: { type: 'array', items: { type: 'object' } },
          key_milestones: { type: 'array', items: { type: 'object' } },
          sensitivity_analysis: { type: 'object' }
        }
      }
    });

    return Response.json(projections);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});