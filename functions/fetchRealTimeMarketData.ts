import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { industries, keywords } = await req.json();

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

    // Query construction for market intelligence
    const query = `Latest market data, trends, and financial news for: ${industries?.join(', ') || keywords?.join(', ')}. Include pricing trends, demand signals, competitor moves, and emerging opportunities. Focus on actionable insights for investors.`;

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
            content: 'You are a market intelligence analyst. Provide structured, data-driven market insights with specific numbers, trends, and actionable intelligence.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    const marketIntel = data.choices[0].message.content;

    // Extract structured data using AI
    const structuredData = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this market intelligence and extract:
1. Key trends (array of objects with trend, impact_score 1-10, timeline)
2. Price movements (array with asset, direction, percentage, reason)
3. Demand signals (array with signal, strength 1-10, source)
4. Competitor activities (array with competitor, action, impact)
5. Opportunities (array with opportunity, confidence 1-10, timeframe)

Market Intelligence:
${marketIntel}

Return valid JSON only.`,
      response_json_schema: {
        type: 'object',
        properties: {
          trends: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                trend: { type: 'string' },
                impact_score: { type: 'number' },
                timeline: { type: 'string' }
              }
            }
          },
          price_movements: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                asset: { type: 'string' },
                direction: { type: 'string' },
                percentage: { type: 'string' },
                reason: { type: 'string' }
              }
            }
          },
          demand_signals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                signal: { type: 'string' },
                strength: { type: 'number' },
                source: { type: 'string' }
              }
            }
          },
          competitor_activities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                competitor: { type: 'string' },
                action: { type: 'string' },
                impact: { type: 'string' }
              }
            }
          },
          opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                opportunity: { type: 'string' },
                confidence: { type: 'number' },
                timeframe: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return Response.json({
      raw_intel: marketIntel,
      structured: structuredData,
      timestamp: new Date().toISOString(),
      sources: data.citations || []
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});