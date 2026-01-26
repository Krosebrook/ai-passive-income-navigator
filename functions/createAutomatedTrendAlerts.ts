import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Detect emerging trends
    const trendsResponse = await base44.functions.invoke('detectEmergingTrends', {});
    
    if (!trendsResponse.data.success) {
      throw new Error('Failed to detect trends');
    }

    const { trends } = trendsResponse.data;
    const createdAlerts = [];

    // Create alerts for high-confidence, low-maturity trends
    for (const trend of trends) {
      const maturity = trend.current_market_maturity || trend.maturity || 0;
      const confidence = trend.confidence_score || 0;
      const growthRate = trend.predicted_growth_rate || trend.growth_rate || 0;
      
      // Alert criteria: nascent (<4), high confidence (>70%), high growth (>50%)
      if (maturity < 4 && confidence > 70 && growthRate > 50) {
        const alert = await base44.entities.TrendAlert.create({
          user_email: user.email,
          trend_name: trend.trend_name || trend.name,
          alert_type: 'emerging_opportunity',
          alert_message: `🚀 Nascent opportunity detected: ${trend.trend_name || trend.name} shows ${growthRate}% predicted growth with ${confidence}% confidence. Current maturity: ${maturity}/10.`,
          trend_data: trend,
          priority: maturity < 2 ? 'high' : 'medium',
          status: 'active',
          created_at: new Date().toISOString()
        });
        
        createdAlerts.push(alert);
        
        // Optionally send email notification
        if (user.email) {
          try {
            await base44.integrations.Core.SendEmail({
              to: user.email,
              subject: `🔥 New Emerging Opportunity: ${trend.trend_name || trend.name}`,
              body: `
                <h2>Nascent Market Opportunity Alert</h2>
                <p><strong>${trend.trend_name || trend.name}</strong></p>
                <p>${trend.investment_opportunity || 'Investment opportunity detected'}</p>
                
                <h3>Key Metrics:</h3>
                <ul>
                  <li>Market Maturity: ${maturity}/10 (nascent)</li>
                  <li>Predicted Growth: ${growthRate}% over 12 months</li>
                  <li>Confidence: ${confidence}%</li>
                  <li>Time to Mainstream: ${trend.time_to_mainstream || 'Unknown'} months</li>
                </ul>
                
                <h3>Why Now?</h3>
                <p>${(trend.key_indicators || []).join(', ')}</p>
                
                <h3>Investment Opportunity:</h3>
                <p>${trend.investment_opportunity || 'Details available in your dashboard'}</p>
                
                <p><a href="${Deno.env.get('BASE44_APP_URL') || 'https://app.flashfusion.io'}/trends">View in Dashboard →</a></p>
              `
            });
          } catch (emailError) {
            console.error('Failed to send alert email:', emailError);
          }
        }
      }
    }

    // Award points for discovering trends
    if (createdAlerts.length > 0) {
      await base44.functions.invoke('awardPoints', {
        user_email: user.email,
        event_type: 'trend_discovered',
        points: createdAlerts.length * 50,
        description: `Discovered ${createdAlerts.length} emerging trend(s)`
      });
    }

    return Response.json({
      success: true,
      alerts_created: createdAlerts.length,
      alerts: createdAlerts,
      trends_analyzed: trends.length
    });

  } catch (error) {
    console.error('Automated alert creation error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to create automated trend alerts'
    }, { status: 500 });
  }
});