import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's goals and investments
    const goals = await base44.entities.FinancialGoal.filter({ user_email: user.email });
    const investments = await base44.entities.Investment.filter({ user_email: user.email });
    
    const totalPortfolioValue = investments.reduce((sum, inv) => 
      sum + (inv.current_value || inv.initial_investment), 0
    );

    const goalUpdates = [];

    for (const goal of goals) {
      // Calculate current progress
      const currentProgress = totalPortfolioValue; // Simplified - could be more sophisticated
      const progressPercentage = (currentProgress / goal.target_amount) * 100;
      
      // Calculate time remaining
      const targetDate = new Date(goal.target_date);
      const now = new Date();
      const monthsRemaining = Math.max(0, (targetDate - now) / (1000 * 60 * 60 * 24 * 30));
      
      // Analyze with AI
      const analysisPrompt = `
You are a financial goal advisor. Analyze progress toward this financial goal and provide recommendations.

GOAL: ${goal.goal_name}
Type: ${goal.goal_type}
Target Amount: $${goal.target_amount.toLocaleString()}
Current Progress: $${currentProgress.toLocaleString()} (${progressPercentage.toFixed(1)}%)
Target Date: ${goal.target_date}
Months Remaining: ${monthsRemaining.toFixed(0)}
Current Monthly Contribution: $${goal.monthly_contribution || 0}

PORTFOLIO STATUS:
Total Value: $${totalPortfolioValue.toLocaleString()}
Number of Investments: ${investments.length}

Provide:
1. Goal status assessment
2. Required adjustments to monthly contributions
3. Recommended asset allocation changes
4. Risk assessment for timeline
5. Alternative strategies
6. Milestone updates
7. Motivational insights
`;

      const goalAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['on_track', 'needs_adjustment', 'at_risk', 'achieved']
            },
            progress_assessment: {
              type: 'string'
            },
            required_monthly_contribution: {
              type: 'number'
            },
            contribution_adjustment: {
              type: 'object',
              properties: {
                amount: { type: 'number' },
                reason: { type: 'string' }
              }
            },
            recommended_allocation: {
              type: 'object',
              properties: {
                conservative: { type: 'number' },
                moderate: { type: 'number' },
                aggressive: { type: 'number' }
              }
            },
            risk_assessment: {
              type: 'object',
              properties: {
                likelihood_of_success: { type: 'number' },
                key_risks: { type: 'array', items: { type: 'string' } },
                mitigation_strategies: { type: 'array', items: { type: 'string' } }
              }
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  recommendation: { type: 'string' },
                  priority: { type: 'string' },
                  expected_impact: { type: 'string' }
                }
              }
            },
            milestones: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  percentage: { type: 'number' },
                  target_date: { type: 'string' },
                  on_track: { type: 'boolean' }
                }
              }
            }
          }
        }
      });

      // Update goal with new data
      const updatedGoal = await base44.entities.FinancialGoal.update(goal.id, {
        current_progress: currentProgress,
        status: goalAnalysis.status,
        recommended_allocation: goalAnalysis.recommended_allocation,
        monthly_contribution: goalAnalysis.required_monthly_contribution
      });

      // Create alert if goal is at risk
      if (goalAnalysis.status === 'at_risk' || goalAnalysis.status === 'needs_adjustment') {
        await base44.entities.InvestmentAlert.create({
          title: `Goal Alert: ${goal.goal_name}`,
          description: goalAnalysis.progress_assessment,
          severity: goalAnalysis.status === 'at_risk' ? 'high' : 'medium',
          alert_type: 'rebalancing_needed',
          recommended_action: goalAnalysis.recommendations[0]?.recommendation || 'Review goal strategy'
        });
      }

      goalUpdates.push({
        goal_id: goal.id,
        goal_name: goal.goal_name,
        analysis: goalAnalysis
      });
    }

    return Response.json({
      success: true,
      goals_analyzed: goals.length,
      updates: goalUpdates
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});