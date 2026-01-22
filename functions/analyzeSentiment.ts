import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deal_id, company_name, industry } = await req.json();

    if (!industry && !company_name) {
      return Response.json({ error: 'industry or company_name is required' }, { status: 400 });
    }

    // Use LLM with internet context for sentiment analysis
    const prompt = `
Perform comprehensive sentiment analysis on ${company_name || industry} from recent news, social media, and market discussions.

Analyze:
1. Overall sentiment (positive, neutral, negative)
2. Key themes and topics being discussed
3. Recent significant events or announcements
4. Public perception and brand reputation
5. Industry trends and competitive landscape
6. Risk indicators from public discourse
7. Growth signals and opportunities

Provide a sentiment score from -1 (very negative) to +1 (very positive).
`;

    const sentimentAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          sentiment_score: { type: 'number' },
          sentiment_label: { 
            type: 'string',
            enum: ['very_positive', 'positive', 'neutral', 'negative', 'very_negative']
          },
          key_themes: {
            type: 'array',
            items: { type: 'string' }
          },
          recent_events: {
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
          risk_indicators: {
            type: 'array',
            items: { type: 'string' }
          },
          growth_signals: {
            type: 'array',
            items: { type: 'string' }
          },
          market_perception: { type: 'string' },
          recommendation: { type: 'string' }
        }
      }
    });

    // If deal_id provided, update the deal
    if (deal_id) {
      await base44.entities.SourcedDealOpportunity.update(deal_id, {
        sentiment_analysis: sentimentAnalysis,
        sentiment_analyzed_at: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      analysis: sentimentAnalysis
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});