import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, timeframe = '7d' } = await req.json();

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

    // Get recent news
    const newsQuery = `Recent financial news and developments about ${topic} in the last ${timeframe}. Include sentiment indicators, major events, analyst opinions, and market reactions.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a financial news analyst. Provide comprehensive news coverage with sentiment analysis and market impact assessment.'
          },
          {
            role: 'user',
            content: newsQuery
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    const data = await response.json();
    const newsContent = data.choices[0].message.content;

    // Analyze sentiment and extract insights
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze the sentiment and market impact of this news:

${newsContent}

Provide:
1. Overall sentiment score (-1 to 1, where -1=very bearish, 0=neutral, 1=very bullish)
2. Sentiment breakdown by theme (array of {theme, sentiment, confidence})
3. Key events (array of {event, date, impact_score, sentiment})
4. Market implications (array of {implication, timeframe, probability})
5. Risk factors identified (array of {risk, severity, mitigation})
6. Opportunity signals (array of {signal, strength, actionability})

Return valid JSON only.`,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_sentiment: { type: 'number' },
          sentiment_label: { type: 'string' },
          confidence: { type: 'number' },
          themes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                theme: { type: 'string' },
                sentiment: { type: 'number' },
                confidence: { type: 'number' }
              }
            }
          },
          key_events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                event: { type: 'string' },
                date: { type: 'string' },
                impact_score: { type: 'number' },
                sentiment: { type: 'string' }
              }
            }
          },
          market_implications: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                implication: { type: 'string' },
                timeframe: { type: 'string' },
                probability: { type: 'number' }
              }
            }
          },
          risk_factors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                risk: { type: 'string' },
                severity: { type: 'number' },
                mitigation: { type: 'string' }
              }
            }
          },
          opportunity_signals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                signal: { type: 'string' },
                strength: { type: 'number' },
                actionability: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return Response.json({
      topic,
      timeframe,
      raw_news: newsContent,
      analysis,
      sources: data.citations || [],
      analyzed_at: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});