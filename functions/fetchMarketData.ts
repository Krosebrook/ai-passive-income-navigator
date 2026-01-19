import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { industries = [] } = await req.json();

    // Fetch real-time market data using AI with internet access
    const marketDataPrompt = `
Get the latest real-time market data for the following:

1. Major indices: S&P 500, NASDAQ, Dow Jones, VIX
2. Commodities: Oil (WTI), Gold, Bitcoin
3. Overall market sentiment (bullish/bearish/neutral)
4. Market volatility assessment

${industries.length > 0 ? `
Also provide industry-specific data for these sectors:
${industries.map((ind, i) => `${i + 1}. ${ind}`).join('\n')}

For each industry, include:
- Current performance/trend
- Percent change today
- Market sentiment
- 3 key trends or developments
` : ''}

Format the response as actionable market intelligence with specific numbers and percentages.
`;

    const marketData = await base44.integrations.Core.InvokeLLM({
      prompt: marketDataPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          indices: {
            type: "object",
            properties: {
              sp500: { type: "number" },
              nasdaq: { type: "number" },
              dow: { type: "number" },
              vix: { type: "number" }
            }
          },
          commodities: {
            type: "object",
            properties: {
              oil: { type: "number" },
              gold: { type: "number" },
              bitcoin: { type: "number" }
            }
          },
          overall_sentiment: {
            type: "object",
            properties: {
              score: { type: "number" },
              description: { type: "string" },
              key_factors: {
                type: "array",
                items: { type: "string" }
              }
            }
          },
          industries: {
            type: "object",
            additionalProperties: {
              type: "object",
              properties: {
                performance: { type: "string" },
                change_percent: { type: "number" },
                sentiment: { type: "string" },
                key_trends: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      }
    });

    // Store snapshot
    const snapshot = await base44.entities.MarketDataSnapshot.create({
      snapshot_date: new Date().toISOString(),
      market_indices: marketData.indices,
      commodities: marketData.commodities,
      industry_data: marketData.industries || {},
      sentiment_score: marketData.overall_sentiment?.score || 0,
      volatility_index: marketData.indices?.vix || 0
    });

    // Check for triggered alerts
    const alerts = await base44.entities.MarketAlert.filter({ 
      is_active: true 
    });

    const triggeredAlerts = [];

    for (const alert of alerts) {
      const industryData = marketData.industries?.[alert.industry];
      if (!industryData) continue;

      let shouldTrigger = false;
      let value = 0;

      switch (alert.metric) {
        case 'price_change':
          value = Math.abs(industryData.change_percent || 0);
          shouldTrigger = alert.condition === 'changes_by' && value >= alert.threshold;
          break;
        case 'sentiment':
          const sentimentMap = { bearish: -1, neutral: 0, bullish: 1 };
          value = sentimentMap[industryData.sentiment?.toLowerCase()] || 0;
          shouldTrigger = (alert.condition === 'above' && value > alert.threshold) ||
                         (alert.condition === 'below' && value < alert.threshold);
          break;
      }

      if (shouldTrigger) {
        triggeredAlerts.push(alert);
        
        // Update last triggered
        await base44.entities.MarketAlert.update(alert.id, {
          last_triggered: new Date().toISOString()
        });

        // Send notifications
        if (alert.notification_channels.includes('email')) {
          await base44.integrations.Core.SendEmail({
            to: alert.user_email || user.email,
            subject: `Market Alert: ${alert.alert_name}`,
            body: `Your market alert for ${alert.industry} has been triggered.\n\nCurrent ${alert.metric}: ${value}\nThreshold: ${alert.threshold}\n\nCheck your dashboard for details.`
          });
        }

        if (alert.notification_channels.includes('in_app')) {
          await base44.entities.InvestmentAlert.create({
            title: `Market Alert: ${alert.alert_name}`,
            description: `${alert.industry} ${alert.metric} is ${alert.condition} ${alert.threshold}. Current value: ${value.toFixed(2)}`,
            severity: 'high',
            alert_type: 'market_risk',
            status: 'active',
            generated_at: new Date().toISOString()
          });
        }
      }
    }

    return Response.json({
      success: true,
      data: {
        snapshot,
        marketData,
        triggeredAlerts: triggeredAlerts.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Market data fetch error:', error);
    return Response.json({ 
      error: error.message || 'Failed to fetch market data' 
    }, { status: 500 });
  }
});