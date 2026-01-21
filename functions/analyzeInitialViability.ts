import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { deal_id } = await req.json();

        if (!deal_id) {
            return Response.json({ error: 'deal_id required' }, { status: 400 });
        }

        // Get the deal
        const deals = await base44.entities.SourcedDealOpportunity.filter({ id: deal_id });
        const deal = deals[0];

        if (!deal) {
            return Response.json({ error: 'Deal not found' }, { status: 404 });
        }

        // Get user preferences for context
        const prefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
        const userPrefs = prefs[0] || {};

        // Get market context
        const marketSnapshots = await base44.entities.MarketDataSnapshot.list('-created_date', 1);
        const latestMarket = marketSnapshots[0] || {};

        // Perform comprehensive viability analysis
        const analysisPrompt = `
Perform a rapid initial viability analysis for this investment opportunity:

DEAL DETAILS:
- Title: ${deal.title}
- Industry: ${deal.industry}
- Summary: ${deal.summary}
- Required Investment: $${deal.required_investment?.toLocaleString()}
- Deal Structure: ${deal.deal_structure}
- Key Opportunities: ${deal.key_opportunities?.join(', ')}
- Key Risks: ${deal.key_risks?.join(', ')}

USER PROFILE:
- Risk Tolerance: ${userPrefs.risk_tolerance || 'moderate'}
- Time Horizon: ${userPrefs.time_horizon || 'medium_term'}
- Target Industries: ${userPrefs.target_industries?.join(', ') || 'various'}

MARKET CONTEXT:
- Overall Sentiment: ${latestMarket.sentiment_score || 0}
- Volatility: ${latestMarket.volatility_index || 0}
- Industry Trends: ${JSON.stringify(latestMarket.industry_data?.[deal.industry] || {})}

Provide:
1. viability_score (0-100): Overall viability considering all factors
2. market_fit_score (0-100): How well this fits current market conditions
3. user_alignment_score (0-100): How well this aligns with user preferences
4. quick_assessment (string): 2-3 sentence executive summary
5. red_flags (array): Immediate concerns or dealbreakers
6. green_flags (array): Strong positive indicators
7. time_to_roi (string): Estimated time to see returns (e.g., "12-18 months")
8. confidence_level (low/medium/high): Confidence in this assessment
9. recommended_action (string): immediate_pursue, investigate_further, pass, or watch_list
10. next_steps (array): 3-5 specific action items if pursuing

Return as JSON.`;

        const analysis = await base44.integrations.Core.InvokeLLM({
            prompt: analysisPrompt,
            response_json_schema: {
                type: 'object',
                properties: {
                    viability_score: { type: 'number' },
                    market_fit_score: { type: 'number' },
                    user_alignment_score: { type: 'number' },
                    quick_assessment: { type: 'string' },
                    red_flags: { type: 'array', items: { type: 'string' } },
                    green_flags: { type: 'array', items: { type: 'string' } },
                    time_to_roi: { type: 'string' },
                    confidence_level: { type: 'string' },
                    recommended_action: { type: 'string' },
                    next_steps: { type: 'array', items: { type: 'string' } }
                }
            }
        });

        // Update deal with viability analysis
        await base44.entities.SourcedDealOpportunity.update(deal_id, {
            dd_viability_summary: analysis.quick_assessment,
            dd_red_flags: analysis.red_flags,
            dd_actionable_steps: analysis.next_steps,
            prediction_confidence: analysis.viability_score,
            dd_analyzed_at: new Date().toISOString()
        });

        return Response.json({
            success: true,
            deal_id,
            analysis
        });

    } catch (error) {
        console.error('Error analyzing viability:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});