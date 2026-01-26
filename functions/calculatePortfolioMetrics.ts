import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all investments
    const investments = await base44.entities.Investment.filter({ 
      user_email: user.email 
    });

    if (investments.length === 0) {
      return Response.json({
        success: true,
        total_invested: 0,
        current_value: 0,
        roi: 0,
        irr: 0,
        metrics: {}
      });
    }

    // Calculate overall metrics
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.initial_investment || 0), 0);
    const currentValue = investments.reduce((sum, inv) => sum + (inv.current_value || inv.initial_investment || 0), 0);
    const overallROI = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;

    // Calculate IRR (simplified annualized return)
    const avgInvestmentAge = investments.reduce((sum, inv) => {
      const ageInYears = (new Date() - new Date(inv.investment_date)) / (365 * 24 * 60 * 60 * 1000);
      return sum + ageInYears;
    }, 0) / investments.length;
    
    const irr = avgInvestmentAge > 0 ? (Math.pow(currentValue / totalInvested, 1 / avgInvestmentAge) - 1) * 100 : 0;

    // Breakdown by industry
    const byIndustry = {};
    investments.forEach(inv => {
      const industry = inv.industry || 'Other';
      if (!byIndustry[industry]) {
        byIndustry[industry] = {
          count: 0,
          invested: 0,
          current_value: 0,
          roi: 0
        };
      }
      byIndustry[industry].count++;
      byIndustry[industry].invested += inv.initial_investment || 0;
      byIndustry[industry].current_value += inv.current_value || inv.initial_investment || 0;
    });

    Object.keys(byIndustry).forEach(industry => {
      const data = byIndustry[industry];
      data.roi = data.invested > 0 ? ((data.current_value - data.invested) / data.invested) * 100 : 0;
    });

    // Breakdown by status
    const byStatus = {
      active: { count: 0, value: 0 },
      exited: { count: 0, value: 0 },
      at_risk: { count: 0, value: 0 }
    };

    investments.forEach(inv => {
      const status = inv.status || 'active';
      if (byStatus[status]) {
        byStatus[status].count++;
        byStatus[status].value += inv.current_value || inv.initial_investment || 0;
      }
    });

    // Unrealized vs Realized gains
    const unrealizedGains = investments
      .filter(inv => inv.status === 'active')
      .reduce((sum, inv) => sum + ((inv.current_value || inv.initial_investment) - inv.initial_investment), 0);
    
    const realizedGains = investments
      .filter(inv => inv.status === 'exited')
      .reduce((sum, inv) => sum + ((inv.current_value || inv.initial_investment) - inv.initial_investment), 0);

    // Performance over time (monthly)
    const performanceHistory = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7);
      
      const valueAtDate = investments.reduce((sum, inv) => {
        const invDate = new Date(inv.investment_date);
        if (invDate <= date) {
          // Simplified: assume linear growth
          return sum + (inv.current_value || inv.initial_investment || 0);
        }
        return sum;
      }, 0);
      
      performanceHistory.push({
        month: monthStr,
        value: valueAtDate
      });
    }

    return Response.json({
      success: true,
      total_invested: totalInvested,
      current_value: currentValue,
      total_gain: currentValue - totalInvested,
      roi: overallROI,
      irr: irr,
      unrealized_gains: unrealizedGains,
      realized_gains: realizedGains,
      by_industry: byIndustry,
      by_status: byStatus,
      performance_history: performanceHistory,
      total_investments: investments.length
    });

  } catch (error) {
    console.error('Portfolio metrics calculation error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to calculate portfolio metrics'
    }, { status: 500 });
  }
});