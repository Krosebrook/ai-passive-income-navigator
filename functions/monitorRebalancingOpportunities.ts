import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This function runs as a scheduled automation (admin-only)
    // No user authentication needed for scheduled tasks
    
    // Get all users with investments
    const allInvestments = await base44.asServiceRole.entities.Investment.list();
    const userEmails = [...new Set(allInvestments.map(inv => inv.user_email))];

    let alertsCreated = 0;

    for (const userEmail of userEmails) {
      try {
        // Generate forecast for this user
        const userInvestments = allInvestments.filter(inv => inv.user_email === userEmail);
        
        if (userInvestments.length === 0) continue;

        // Check if we already have a recent forecast
        const recentForecasts = await base44.asServiceRole.entities.FinancialPrediction.filter({
          user_email: userEmail,
          prediction_type: 'portfolio_forecast'
        });

        const latestForecast = recentForecasts.sort((a, b) => 
          new Date(b.created_date) - new Date(a.created_date)
        )[0];

        // Skip if forecast is less than 7 days old
        if (latestForecast) {
          const daysSinceForecast = (new Date() - new Date(latestForecast.created_date)) / (1000 * 60 * 60 * 24);
          if (daysSinceForecast < 7) continue;
        }

        // Generate new forecast and rebalancing recommendations
        const forecastResponse = await base44.asServiceRole.functions.invoke('forecastPortfolioPerformance', {
          timeframe: '12_months'
        });

        const forecast = forecastResponse.data?.forecast;
        
        if (forecast?.rebalancing_recommendations) {
          // Create alerts for high-priority recommendations
          const highPriorityRecs = forecast.rebalancing_recommendations.filter(
            rec => rec.priority === 'high'
          );

          for (const rec of highPriorityRecs) {
            await base44.asServiceRole.entities.InvestmentAlert.create({
              title: `Rebalancing Opportunity: ${rec.target}`,
              description: rec.rationale,
              severity: 'high',
              alert_type: 'rebalancing_needed',
              affected_areas: [rec.target],
              recommended_action: `${rec.action} position by ${rec.percentage_change}%`,
              status: 'active',
              generated_at: new Date().toISOString()
            });

            alertsCreated++;
          }
        }
      } catch (error) {
        console.error(`Error processing user ${userEmail}:`, error);
      }
    }

    return Response.json({
      success: true,
      users_processed: userEmails.length,
      alerts_created: alertsCreated,
      processed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Rebalancing monitoring error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to monitor rebalancing opportunities'
    }, { status: 500 });
  }
});