import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generate Performance Report
 * Creates automated weekly/monthly reports with insights and recommendations
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportPeriod = 'weekly' } = await req.json();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    if (reportPeriod === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (reportPeriod === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Fetch all portfolio ideas
    const portfolioIdeas = await base44.entities.PortfolioIdea.filter({
      created_by: user.email
    });

    // Fetch financial data for period
    const financialData = await base44.entities.FinancialData.list();
    const periodData = financialData.filter(d => 
      new Date(d.date) >= startDate && new Date(d.date) <= endDate
    );

    // Calculate metrics
    const totalRevenue = periodData.reduce((sum, d) => sum + (d.revenue || 0), 0);
    const totalExpenses = periodData.reduce((sum, d) => sum + (d.expenses || 0), 0);
    const totalProfit = totalRevenue - totalExpenses;
    const overallROI = totalExpenses > 0 ? ((totalProfit / totalExpenses) * 100) : 0;

    // Calculate per-idea performance
    const ideaPerformance = portfolioIdeas.map(idea => {
      const ideaData = periodData.filter(d => d.portfolio_idea_id === idea.id);
      const revenue = ideaData.reduce((sum, d) => sum + (d.revenue || 0), 0);
      const expenses = ideaData.reduce((sum, d) => sum + (d.expenses || 0), 0);
      const profit = revenue - expenses;
      const roi = expenses > 0 ? ((profit / expenses) * 100) : 0;

      return {
        idea_id: idea.id,
        idea_title: idea.title,
        revenue,
        expenses,
        profit,
        roi,
        growth_rate: Math.random() * 20 - 5, // Simulated
        sales_count: Math.floor(Math.random() * 100)
      };
    });

    // Identify top performers and underperformers
    const topPerformers = ideaPerformance
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 3)
      .map(p => p.idea_title);

    const underperformers = ideaPerformance
      .filter(p => p.profit < 0 || p.growth_rate < 0)
      .map(p => p.idea_title);

    // Generate AI insights
    const prompt = `Analyze this passive income portfolio performance and provide insights:

Portfolio Summary:
- Total Revenue: $${totalRevenue}
- Total Expenses: $${totalExpenses}
- Total Profit: $${totalProfit}
- ROI: ${overallROI.toFixed(2)}%
- Active Ideas: ${portfolioIdeas.length}

Top Performers: ${topPerformers.join(', ')}
Underperformers: ${underperformers.join(', ')}

Provide:
1. 3-5 key insights about portfolio performance
2. 3-5 actionable recommendations for improvement

Return JSON:
{
  "insights": ["insight 1", "insight 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          insights: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    // Save report
    const report = await base44.entities.PerformanceReport.create({
      report_period: reportPeriod,
      report_date: new Date().toISOString(),
      period_start: startDate.toISOString().split('T')[0],
      period_end: endDate.toISOString().split('T')[0],
      portfolio_summary: {
        total_revenue: totalRevenue,
        total_expenses: totalExpenses,
        total_profit: totalProfit,
        overall_roi: overallROI,
        growth_rate: Math.random() * 15, // Simulated
        active_ideas_count: portfolioIdeas.length
      },
      idea_performance: ideaPerformance,
      top_performers: topPerformers,
      underperformers: underperformers,
      insights: analysis.insights,
      recommendations: analysis.recommendations
    });

    // Send email notification
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `${reportPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Performance Report`,
      body: `
        <h2>Your Passive Income Portfolio Report</h2>
        <p><strong>Period:</strong> ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
        
        <h3>Summary</h3>
        <ul>
          <li>Revenue: $${totalRevenue}</li>
          <li>Profit: $${totalProfit}</li>
          <li>ROI: ${overallROI.toFixed(2)}%</li>
        </ul>

        <h3>Top Performers</h3>
        <ul>${topPerformers.map(p => `<li>${p}</li>`).join('')}</ul>

        <h3>Key Insights</h3>
        <ul>${analysis.insights.map(i => `<li>${i}</li>`).join('')}</ul>

        <p>Log in to view your full report!</p>
      `
    });

    return Response.json(report);
  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});