import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Live Market Pulse - fetches real-time market data, trending deals,
 * news sentiment, and sector momentum using web scraping + AI synthesis.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { sectors, force_refresh } = await req.json().catch(() => ({}));

    // Check cache (use last snapshot if < 4 hours old)
    if (!force_refresh) {
      const recent = await base44.entities.MarketDataSnapshot.list('-snapshot_date', 1);
      if (recent[0]) {
        const age = Date.now() - new Date(recent[0].snapshot_date).getTime();
        if (age < 4 * 60 * 60 * 1000) {
          return Response.json({ success: true, cached: true, data: recent[0] });
        }
      }
    }

    const targetSectors = sectors || [
      'AI & Machine Learning', 'Climate Tech', 'Healthcare SaaS',
      'Fintech', 'E-commerce', 'Real Estate Tech', 'Creator Economy',
      'Cybersecurity', 'Supply Chain Tech', 'EdTech'
    ];

    const marketPulse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a real-time market intelligence analyst. Provide a comprehensive market pulse for investment decision-making as of today.

SECTORS TO ANALYZE: ${targetSectors.join(', ')}

For each sector, provide:
1. Current momentum (bull/neutral/bear) with reasoning
2. Hot deals and funding activity in last 30 days
3. Key news affecting valuations
4. Best entry points right now
5. Sectors to avoid and why

Also provide:
- Overall market sentiment (with macro factors: rates, inflation, geopolitics)
- Top 3 emerging opportunities nobody is talking about yet
- 3 sectors with regulatory tailwinds
- Hottest deal structures right now (equity, revenue share, licensing)
- Market fear/greed indicators
- Global opportunities: which regions are hot for deals?`,
      add_context_from_internet: true,
      model: 'gemini_3_pro',
      response_json_schema: {
        type: 'object',
        properties: {
          overall_sentiment: { type: 'string', enum: ['very_bullish', 'bullish', 'neutral', 'bearish', 'very_bearish'] },
          sentiment_score: { type: 'number' },
          macro_context: { type: 'string' },
          sector_data: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              properties: {
                momentum: { type: 'string' },
                deal_activity: { type: 'string' },
                key_news: { type: 'array', items: { type: 'string' } },
                entry_signal: { type: 'string' },
                avg_deal_size: { type: 'string' }
              }
            }
          },
          emerging_opportunities: { type: 'array', items: { type: 'string' } },
          regulatory_tailwinds: { type: 'array', items: { type: 'string' } },
          hot_deal_structures: { type: 'array', items: { type: 'string' } },
          regions_trending: { type: 'array', items: { type: 'string' } },
          avoid_sectors: { type: 'array', items: { type: 'string' } },
          fear_greed_index: { type: 'number' }
        }
      }
    });

    // Save snapshot
    const snapshot = await base44.asServiceRole.entities.MarketDataSnapshot.create({
      snapshot_date: new Date().toISOString(),
      sentiment_score: (marketPulse.sentiment_score || 0) / 100,
      industry_data: marketPulse.sector_data || {},
      volatility_index: 100 - (marketPulse.fear_greed_index || 50),
      market_indices: {},
      raw_pulse: marketPulse
    });

    return Response.json({ success: true, cached: false, data: snapshot, pulse: marketPulse });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});