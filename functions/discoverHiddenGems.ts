import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Hidden Gems Engine - discovers overlooked opportunities the user hasn't thought of.
 * Analyzes portfolio gaps, market blind spots, and contrarian plays.
 * Returns top 10 hidden opportunities with actionable details.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { category } = body;

    // Gather user context
    const [prefs, portfolio, deals, investments] = await Promise.all([
      base44.entities.UserPreferences.filter({ created_by: user.email }).then(r => r[0] || {}),
      base44.entities.PortfolioIdea.list('-created_date', 20),
      base44.entities.SourcedDealOpportunity.list('-created_date', 20),
      base44.entities.Investment.filter({ user_email: user.email })
    ]);

    const existingIndustries = [...new Set([
      ...portfolio.map(p => p.category).filter(Boolean),
      ...deals.map(d => d.industry).filter(Boolean),
      ...investments.map(i => i.industry).filter(Boolean)
    ])];

    const existingIdeas = portfolio.slice(0, 10).map(p => p.name || p.title).filter(Boolean);

    const gemPrompt = `You are a contrarian investment strategist and hidden opportunity finder. Your job is to surface overlooked, underrated, and emerging investment opportunities that most investors ignore.

INVESTOR PROFILE:
- Risk Tolerance: ${prefs.risk_tolerance || 'moderate'}
- Target Industries: ${JSON.stringify(prefs.target_industries || [])}
- Investment Range: $${prefs.investment_size_min || 0} - $${prefs.investment_size_max || 'flexible'}
- Time Horizon: ${prefs.time_horizon || 'medium_term'}
- Existing Portfolio Areas: ${existingIndustries.join(', ') || 'none yet'}
- Current Ideas Being Tracked: ${existingIdeas.join(', ') || 'none yet'}
${category ? `- Focus Category Requested: ${category}` : ''}

YOUR MISSION: Find 10 hidden gems - opportunities this investor is almost certainly NOT thinking about.

Think about:
1. Unglamorous but highly profitable niches (boring businesses with moats)
2. Geographic arbitrage plays (US knowledge → emerging markets)
3. Regulatory tailwinds others are sleeping on
4. Aging infrastructure that desperately needs modernization
5. B2B SaaS verticals still un-disrupted
6. Content/media arbitrage (buy undervalued, modernize, sell)
7. Service businesses with digital transformation upside
8. Platform plays in niche communities
9. Climate/energy transition picks below the radar
10. Demographic tailwinds (aging population, Gen Z economy)

For each gem, provide:
- A catchy, specific opportunity name
- Why it's hidden/overlooked (the contrarian thesis)
- Estimated ROI potential and timeframe
- Entry strategy (how to actually start)
- Current market size
- Risk level and key risks
- Why NOW is the right time
- A rough investment range needed
- One real example or comp deal`;

    const gems = await base44.integrations.Core.InvokeLLM({
      prompt: gemPrompt,
      add_context_from_internet: true,
      model: 'gemini_3_pro',
      response_json_schema: {
        type: 'object',
        properties: {
          gems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                tagline: { type: 'string' },
                contrarian_thesis: { type: 'string' },
                why_overlooked: { type: 'string' },
                why_now: { type: 'string' },
                entry_strategy: { type: 'string' },
                estimated_roi_pct: { type: 'number' },
                roi_timeframe: { type: 'string' },
                market_size: { type: 'string' },
                investment_range_low: { type: 'number' },
                investment_range_high: { type: 'number' },
                risk_level: { type: 'string', enum: ['low', 'medium', 'high'] },
                key_risks: { type: 'array', items: { type: 'string' } },
                real_world_comp: { type: 'string' },
                category: { type: 'string' },
                urgency_score: { type: 'number' }
              }
            }
          },
          market_context: { type: 'string' },
          personalization_notes: { type: 'string' }
        }
      }
    });

    return Response.json({ success: true, ...gems });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});