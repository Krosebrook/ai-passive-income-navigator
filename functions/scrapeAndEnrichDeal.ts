import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Scrapes web for real data about a deal/company and enriches the deal record.
 * Uses Firecrawl (if available) or falls back to AI web search.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { deal_id, query, url } = await req.json();

    let scrapedContent = null;

    // Try Firecrawl first if URL provided
    if (url) {
      const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
      if (firecrawlKey) {
        const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url,
            formats: ['markdown'],
            onlyMainContent: true,
            maxDepth: 1
          })
        });
        if (scrapeRes.ok) {
          const data = await scrapeRes.json();
          scrapedContent = data?.data?.markdown || data?.markdown;
        }
      }
    }

    // Use AI web search to enrich
    const enrichmentPrompt = scrapedContent
      ? `You are a deal analyst. Analyze this scraped content and extract investment-relevant data:

CONTENT:
${scrapedContent.slice(0, 3000)}

Extract:
1. Business model and revenue streams
2. Market size and growth rate
3. Competitive landscape
4. Key risks and opportunities
5. Estimated valuation range
6. Investment readiness signals
7. Key metrics (revenue, users, growth rate if available)`
      : `You are a market research analyst. Research this investment opportunity: "${query}"

Find and compile:
1. Real market data (size, growth rate, key players)
2. Recent news and developments (last 3 months)
3. Comparable deals and valuations
4. Key risks and opportunities
5. Top 3 competitors with brief profiles
6. Investment thesis: why this, why now?
7. Estimated deal value range based on comps`;

    const enrichment = await base44.integrations.Core.InvokeLLM({
      prompt: enrichmentPrompt,
      add_context_from_internet: !scrapedContent,
      response_json_schema: {
        type: 'object',
        properties: {
          business_model: { type: 'string' },
          market_size: { type: 'string' },
          growth_rate: { type: 'string' },
          competitors: { type: 'array', items: { type: 'string' } },
          key_risks: { type: 'array', items: { type: 'string' } },
          opportunities: { type: 'array', items: { type: 'string' } },
          estimated_value_range: { type: 'object', properties: { low: { type: 'number' }, high: { type: 'number' } } },
          investment_thesis: { type: 'string' },
          recent_news: { type: 'array', items: { type: 'string' } },
          recommended_description: { type: 'string' },
          recommended_industry: { type: 'string' }
        }
      }
    });

    // Update deal if deal_id provided
    if (deal_id) {
      await base44.entities.DealPipeline.update(deal_id, {
        enrichment_data: enrichment,
        enriched_at: new Date().toISOString()
      });
    }

    return Response.json({ success: true, enrichment, scraped: !!scrapedContent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});