import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all deals and stages
    const deals = await base44.entities.DealPipeline.list();
    const stages = await base44.entities.DealStage.list('order');
    const tasks = await base44.entities.DealTask.list();

    // Calculate metrics
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Deal cycle time (average days from creation to completion)
    const completedDeals = deals.filter(d => d.stage === 'completed' || d.stage === 'archived');
    const cycleTime = completedDeals.length > 0
      ? completedDeals.reduce((sum, d) => {
          const created = new Date(d.created_date);
          const lastStage = d.stage_history?.[d.stage_history.length - 1];
          const completed = lastStage ? new Date(lastStage.entered_at) : now;
          return sum + (completed - created) / (1000 * 60 * 60 * 24);
        }, 0) / completedDeals.length
      : 0;

    // Conversion rates by stage
    const stageConversion = {};
    stages.forEach((stage, idx) => {
      const dealsInStage = deals.filter(d => d.stage === stage.name.toLowerCase());
      const nextStage = stages[idx + 1];
      
      if (nextStage) {
        const movedToNext = deals.filter(d => 
          d.stage_history?.some(h => 
            h.stage === stage.name.toLowerCase() && 
            d.stage === nextStage.name.toLowerCase()
          )
        ).length;
        
        const totalEntered = deals.filter(d => 
          d.stage_history?.some(h => h.stage === stage.name.toLowerCase())
        ).length;
        
        stageConversion[stage.name] = totalEntered > 0 
          ? Math.round((movedToNext / totalEntered) * 100)
          : 0;
      }
    });

    // Stage distribution
    const stageDistribution = stages.map(stage => ({
      stage: stage.name,
      count: deals.filter(d => d.stage === stage.name.toLowerCase()).length,
      value: deals.filter(d => d.stage === stage.name.toLowerCase())
        .reduce((sum, d) => sum + (d.estimated_value || 0), 0)
    }));

    // Team performance (deals by user)
    const teamPerformance = {};
    deals.forEach(deal => {
      const assignedTo = deal.assigned_to || 'Unassigned';
      if (!teamPerformance[assignedTo]) {
        teamPerformance[assignedTo] = {
          total: 0,
          completed: 0,
          totalValue: 0,
          avgCycleTime: 0
        };
      }
      
      teamPerformance[assignedTo].total += 1;
      teamPerformance[assignedTo].totalValue += deal.estimated_value || 0;
      
      if (deal.stage === 'completed') {
        teamPerformance[assignedTo].completed += 1;
      }
    });

    // Projected ROI
    const activeDeals = deals.filter(d => !['completed', 'archived'].includes(d.stage));
    const projectedROI = activeDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);
    const weightedROI = activeDeals.reduce((sum, d) => {
      const progress = d.progress_percentage || 0;
      return sum + ((d.estimated_value || 0) * (progress / 100));
    }, 0);

    // Recent activity (last 30 days)
    const recentDeals = deals.filter(d => 
      new Date(d.created_date) >= thirtyDaysAgo
    ).length;

    const recentCompletions = completedDeals.filter(d => {
      const lastStage = d.stage_history?.[d.stage_history.length - 1];
      return lastStage && new Date(lastStage.entered_at) >= thirtyDaysAgo;
    }).length;

    // Task completion rate
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const taskCompletionRate = tasks.length > 0 
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

    // Velocity (deals completed per month)
    const monthlyCompletions = {};
    completedDeals.forEach(d => {
      const lastStage = d.stage_history?.[d.stage_history.length - 1];
      if (lastStage) {
        const month = new Date(lastStage.entered_at).toISOString().slice(0, 7);
        monthlyCompletions[month] = (monthlyCompletions[month] || 0) + 1;
      }
    });

    return Response.json({
      success: true,
      analytics: {
        overview: {
          totalDeals: deals.length,
          activeDeals: activeDeals.length,
          completedDeals: completedDeals.length,
          averageCycleTime: Math.round(cycleTime),
          projectedROI,
          weightedROI,
          taskCompletionRate
        },
        stageMetrics: {
          distribution: stageDistribution,
          conversionRates: stageConversion
        },
        teamPerformance: Object.entries(teamPerformance).map(([name, stats]) => ({
          name,
          ...stats,
          completionRate: stats.total > 0 
            ? Math.round((stats.completed / stats.total) * 100)
            : 0
        })),
        recentActivity: {
          newDeals: recentDeals,
          completions: recentCompletions
        },
        velocity: Object.entries(monthlyCompletions).map(([month, count]) => ({
          month,
          completions: count
        })).sort((a, b) => a.month.localeCompare(b.month))
      }
    });

  } catch (error) {
    console.error('Analytics calculation error:', error);
    return Response.json({ 
      error: error.message || 'Failed to calculate analytics' 
    }, { status: 500 });
  }
});