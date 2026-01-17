import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Sync Monetization Data
 * Fetches sales and revenue data from connected platforms
 * Note: This is a simulated sync. Real implementation would use platform APIs
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { portfolioIdeaId } = await req.json();

    if (!portfolioIdeaId) {
      return Response.json({ error: 'Missing portfolioIdeaId' }, { status: 400 });
    }

    // Get all integrations for this portfolio idea
    const integrations = await base44.entities.MonetizationIntegration.filter({
      portfolio_idea_id: portfolioIdeaId
    });

    const syncResults = [];

    for (const integration of integrations) {
      // In production, this would call actual platform APIs
      // For now, we'll generate simulated data
      const simulatedData = {
        sales_count: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 5000) + 500,
        transactions: []
      };

      // Update integration with new data
      await base44.entities.MonetizationIntegration.update(integration.id, {
        total_sales: (integration.total_sales || 0) + simulatedData.sales_count,
        total_revenue: (integration.total_revenue || 0) + simulatedData.revenue,
        last_sync: new Date().toISOString()
      });

      // Create financial data entry
      await base44.entities.FinancialData.create({
        portfolio_idea_id: portfolioIdeaId,
        date: new Date().toISOString().split('T')[0],
        revenue: simulatedData.revenue,
        expenses: Math.floor(simulatedData.revenue * 0.3), // 30% expenses
        profit: Math.floor(simulatedData.revenue * 0.7),
        revenue_sources: {
          [integration.platform]: simulatedData.revenue
        }
      });

      syncResults.push({
        platform: integration.platform,
        synced: true,
        sales: simulatedData.sales_count,
        revenue: simulatedData.revenue
      });
    }

    return Response.json({
      success: true,
      synced_platforms: syncResults.length,
      results: syncResults,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});