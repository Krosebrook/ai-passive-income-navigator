import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user preferences and sourcing criteria
        const userPrefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
        const prefs = userPrefs[0];

        if (!prefs) {
            return Response.json({ error: 'Please complete onboarding first' }, { status: 400 });
        }

        const sourcingCriteria = await base44.entities.DealSourcingCriteria.filter({
            created_by: user.email,
            is_active: true
        });

        if (sourcingCriteria.length === 0) {
            return Response.json({ error: 'No active sourcing criteria defined' }, { status: 400 });
        }

        // Build search prompt for external platforms
        const criteria = sourcingCriteria[0];
        const searchPrompt = `You are an expert deal sourcer for passive income investments. Search the internet and find real deal opportunities matching these criteria:

Investment Range: $${criteria.min_investment || 'any'} - $${criteria.max_investment || 'any'}
Risk Level: ${criteria.risk_tolerance || 'moderate'}
Desired ROI: ${criteria.desired_roi_percentage || '20'}%+ annually
Industries: ${prefs.target_industries?.join(', ') || 'any'}
Deal Structures: ${prefs.preferred_deal_structures?.join(', ') || 'any'}
Geographic Focus: ${prefs.geo_preferences?.join(', ') || 'any'}
Passive Level: ${criteria.passive_level || 'semi_passive'}

For each deal opportunity found, provide:
1. Deal title and brief description
2. Source URL (real or realistic)
3. Investment required
4. Estimated annual return %
5. Estimated time to profitability
6. Industry
7. Key highlights (3-4 bullet points)
8. Potential concerns (2-3 bullet points)

Return 8-12 real or realistic deal opportunities as a JSON array. Focus on: Flippa (website businesses), Empire Flippers, MicroAcquire, AngelList, SBA marketplaces, crowdfunding platforms, and niche deal platforms.`;

        const dealsResponse = await base44.integrations.Core.InvokeLLM({
            prompt: searchPrompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    deals: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                deal_title: { type: "string" },
                                deal_description: { type: "string" },
                                source_url: { type: "string" },
                                source_platform: { type: "string" },
                                estimated_investment: { type: "number" },
                                estimated_roi: { type: "number" },
                                monthly_revenue: { type: "number" },
                                industry: { type: "string" },
                                risk_level: { type: "string" },
                                key_highlights: { type: "array", items: { type: "string" } },
                                potential_concerns: { type: "array", items: { type: "string" } }
                            }
                        }
                    }
                }
            }
        });

        // Score each deal against user criteria
        const scoredDeals = [];
        for (const deal of dealsResponse.deals || []) {
            // Calculate match score (0-100)
            let score = 50; // base score

            // Investment range match
            if (deal.estimated_investment >= (criteria.min_investment || 0) &&
                deal.estimated_investment <= (criteria.max_investment || 999999999)) {
                score += 15;
            }

            // ROI match
            if (deal.estimated_roi >= (criteria.desired_roi_percentage || 0)) {
                score += 20;
            }

            // Industry match
            if (prefs.target_industries?.some(ind => 
                deal.industry.toLowerCase().includes(ind.toLowerCase()))) {
                score += 15;
            }

            // Risk tolerance match
            const riskScores = {
                'low': { 'low': 25, 'medium': 10, 'high': -10 },
                'medium': { 'low': 15, 'medium': 25, 'high': 10 },
                'high': { 'low': 10, 'medium': 20, 'high': 25 }
            };
            const riskScore = riskScores[criteria.risk_tolerance || 'medium']?.[deal.risk_level] || 0;
            score += riskScore;

            // Time to profitability bonus
            if (criteria.time_to_profitability_months) {
                // Assuming monthly revenue can estimate time to profitability
                const profitabilityMonths = deal.estimated_investment / (deal.monthly_revenue || 1);
                if (profitabilityMonths <= criteria.time_to_profitability_months) {
                    score += 10;
                }
            }

            score = Math.min(100, Math.max(0, score));

            scoredDeals.push({
                ...deal,
                ai_match_score: Math.round(score),
                criteria_id: criteria.id,
                status: 'new'
            });
        }

        // Sort by score
        scoredDeals.sort((a, b) => b.ai_match_score - a.ai_match_score);

        // Save sourced deals to database
        const createdDeals = await base44.entities.SourcedDealOpportunity.bulkCreate(scoredDeals);

        return Response.json({
            success: true,
            deals_found: createdDeals.length,
            top_matches: createdDeals.slice(0, 5),
            all_deals: createdDeals,
            sourced_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error sourcing deals:', error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});