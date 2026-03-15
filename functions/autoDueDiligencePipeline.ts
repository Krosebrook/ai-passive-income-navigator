import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Auto-triggered due diligence for newly added DealPipeline deals.
 * Pulls market data, performs SWOT analysis, verifies key claims.
 * Saves results to the deal as `auto_dd_report`.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Support both direct invocation and entity automation payloads
    let deal_id;
    const body = await req.json();

    if (body.event && body.data) {
      // Called from entity automation
      deal_id = body.event.entity_id;
    } else {
      deal_id = body.deal_id;
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!deal_id) return Response.json({ error: 'deal_id required' }, { status: 400 });

    const deal = await base44.asServiceRole.entities.DealPipeline.get(deal_id);
    if (!deal) return Response.json({ error: 'Deal not found' }, { status: 404 });

    // Mark as in-progress
    await base44.asServiceRole.entities.DealPipeline.update(deal_id, {
      auto_dd_status: 'running',
      auto_dd_started_at: new Date().toISOString()
    });

    // ── Step 1: Market Data & Competitive Landscape ──────────────────────────
    const marketData = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a market research analyst. Research the following deal opportunity for an investor.

DEAL: ${deal.deal_name}
DESCRIPTION: ${deal.deal_description || 'Not provided'}
INDUSTRY: ${deal.industry || 'Unknown'}
ESTIMATED VALUE: $${deal.estimated_value || 0}

Research and provide:
1. Current market size and growth rate for this industry/segment
2. Top 5 direct competitors with brief profiles
3. Key market trends affecting this opportunity (next 2-3 years)
4. Market entry barriers and challenges
5. Regulatory environment overview
6. Key success factors in this space
7. Overall market sentiment (bullish/neutral/bearish)

Be specific and data-driven.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          market_size_usd: { type: 'string' },
          growth_rate: { type: 'string' },
          market_sentiment: { type: 'string', enum: ['bullish', 'neutral', 'bearish'] },
          competitors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                threat_level: { type: 'string', enum: ['low', 'medium', 'high'] }
              }
            }
          },
          key_trends: { type: 'array', items: { type: 'string' } },
          entry_barriers: { type: 'array', items: { type: 'string' } },
          key_success_factors: { type: 'array', items: { type: 'string' } },
          regulatory_notes: { type: 'string' }
        }
      }
    });

    // ── Step 2: SWOT Analysis ─────────────────────────────────────────────────
    const swotAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Perform a comprehensive SWOT analysis for the following investment opportunity.

DEAL: ${deal.deal_name}
DESCRIPTION: ${deal.deal_description || 'Not provided'}
INDUSTRY: ${deal.industry || 'Unknown'}
ESTIMATED VALUE: $${deal.estimated_value || 0}
MARKET CONTEXT: ${JSON.stringify(marketData)}

Provide a detailed SWOT analysis with 4-6 points per quadrant. Each point should be specific, actionable, and investor-focused.`,
      response_json_schema: {
        type: 'object',
        properties: {
          strengths: { type: 'array', items: { type: 'string' } },
          weaknesses: { type: 'array', items: { type: 'string' } },
          opportunities: { type: 'array', items: { type: 'string' } },
          threats: { type: 'array', items: { type: 'string' } },
          swot_summary: { type: 'string' },
          overall_viability: { type: 'string', enum: ['strong', 'moderate', 'weak', 'poor'] }
        }
      }
    });

    // ── Step 3: Claims Verification ───────────────────────────────────────────
    const claimsVerification = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a fact-checker and due diligence investigator. Verify the key claims made in this investment opportunity.

DEAL: ${deal.deal_name}
DESCRIPTION: ${deal.deal_description || 'Not provided'}
ESTIMATED VALUE: $${deal.estimated_value || 0}
NOTES: ${deal.notes || 'None'}

For this deal opportunity:
1. Identify the key claims or assertions being made
2. Assess the credibility and verifiability of each claim
3. Flag any claims that seem overstated, questionable, or unverifiable
4. Assign a credibility score (1-10) to each key claim
5. Provide an overall trustworthiness assessment
6. List any red flags or inconsistencies`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          claims: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                claim: { type: 'string' },
                credibility_score: { type: 'number' },
                verification_status: { type: 'string', enum: ['verified', 'plausible', 'questionable', 'unverifiable', 'false'] },
                notes: { type: 'string' }
              }
            }
          },
          red_flags: { type: 'array', items: { type: 'string' } },
          overall_credibility_score: { type: 'number' },
          trustworthiness_assessment: { type: 'string' }
        }
      }
    });

    // ── Step 4: Executive Summary ─────────────────────────────────────────────
    const executiveSummary = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Create a concise executive summary for this deal's due diligence report.

DEAL: ${deal.deal_name}
MARKET DATA: ${JSON.stringify(marketData)}
SWOT: ${JSON.stringify(swotAnalysis)}
CLAIMS VERIFICATION: ${JSON.stringify(claimsVerification)}

Provide:
1. Investment recommendation (proceed / proceed_with_caution / do_not_proceed / needs_more_info)
2. Confidence score (0-100)
3. Top 3 reasons to invest
4. Top 3 risks / concerns
5. Suggested next actions (2-3 specific steps)
6. Overall DD summary paragraph (2-3 sentences)`,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendation: { type: 'string', enum: ['proceed', 'proceed_with_caution', 'do_not_proceed', 'needs_more_info'] },
          confidence_score: { type: 'number' },
          reasons_to_invest: { type: 'array', items: { type: 'string' } },
          key_risks: { type: 'array', items: { type: 'string' } },
          next_actions: { type: 'array', items: { type: 'string' } },
          summary_paragraph: { type: 'string' }
        }
      }
    });

    const report = {
      deal_id,
      deal_name: deal.deal_name,
      market_research: marketData,
      swot_analysis: swotAnalysis,
      claims_verification: claimsVerification,
      executive_summary: executiveSummary,
      generated_at: new Date().toISOString(),
      version: 1
    };

    await base44.asServiceRole.entities.DealPipeline.update(deal_id, {
      auto_dd_report: report,
      auto_dd_status: 'completed',
      auto_dd_completed_at: new Date().toISOString()
    });

    return Response.json({ success: true, report });
  } catch (error) {
    // Try to mark as failed if we have a deal_id
    try {
      const base44 = createClientFromRequest(req);
      const body = await req.clone().json().catch(() => ({}));
      const did = body.deal_id || body.event?.entity_id;
      if (did) {
        await base44.asServiceRole.entities.DealPipeline.update(did, {
          auto_dd_status: 'failed'
        });
      }
    } catch (_) { /* silent */ }

    return Response.json({ error: error.message }, { status: 500 });
  }
});