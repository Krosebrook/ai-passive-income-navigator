import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deal_ids, timeframe = '30d' } = await req.json();

    // Fetch user's deals
    const deals = await base44.asServiceRole.entities.SourcedDealOpportunity.filter({
      id: { $in: deal_ids }
    });

    if (!deals || deals.length === 0) {
      return Response.json({ error: 'No deals found' }, { status: 404 });
    }

    // Fetch investments for performance data
    const investments = await base44.asServiceRole.entities.Investment.filter({
      user_email: user.email,
      deal_id: { $in: deal_ids }
    });

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

    // Analyze each deal
    const correlations = [];

    for (const deal of deals) {
      const investment = investments.find(inv => inv.deal_id === deal.id);
      
      // Get news for this deal's industry
      const newsQuery = `Recent news and developments affecting ${deal.industry} sector, specifically related to ${deal.title}. Last ${timeframe}.`;

      const newsResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            { role: 'system', content: 'You are a financial analyst correlating news events with investment performance.' },
            { role: 'user', content: newsQuery }
          ],
          temperature: 0.2,
          max_tokens: 1500
        })
      });

      const newsData = await newsResponse.json();
      const newsContent = newsData.choices[0].message.content;

      // Correlate with performance
      const correlation = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze correlation between news and deal performance:

Deal: ${deal.title}
Industry: ${deal.industry}
${investment ? `Current ROI: ${investment.actual_roi}%` : 'No investment data yet'}
${investment ? `Performance trend: ${investment.status}` : ''}

Recent News:
${newsContent}

Provide:
1. Sentiment impact score (-1 to 1)
2. Key events affecting performance (array)
3. Correlation strength (0-100)
4. Predicted impact on future performance
5. Recommended actions based on news

Return valid JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            deal_id: { type: 'string' },
            sentiment_impact: { type: 'number' },
            correlation_strength: { type: 'number' },
            key_events: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  event: { type: 'string' },
                  impact: { type: 'string' },
                  date: { type: 'string' }
                }
              }
            },
            predicted_impact: {
              type: 'object',
              properties: {
                short_term: { type: 'string' },
                medium_term: { type: 'string' },
                long_term: { type: 'string' }
              }
            },
            recommended_actions: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      correlations.push({
        deal,
        investment,
        news_summary: newsContent,
        correlation: { ...correlation, deal_id: deal.id },
        sources: newsData.citations || []
      });
    }

    // Overall portfolio impact
    const portfolioAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze overall portfolio impact from news correlations:

${JSON.stringify(correlations.map(c => ({
  deal: c.deal.title,
  sentiment: c.correlation.sentiment_impact,
  correlation: c.correlation.correlation_strength
})))}

Provide:
1. Overall portfolio sentiment
2. High-impact correlations
3. Diversification assessment
4. Portfolio-level recommendations

Return valid JSON.`,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_sentiment: { type: 'number' },
          portfolio_risk_score: { type: 'number' },
          high_impact_items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                deal_id: { type: 'string' },
                impact: { type: 'string' },
                urgency: { type: 'string' }
              }
            }
          },
          diversification_score: { type: 'number' },
          recommendations: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    return Response.json({
      correlations,
      portfolio_analysis: portfolioAnalysis,
      analyzed_at: new Date().toISOString(),
      timeframe
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});