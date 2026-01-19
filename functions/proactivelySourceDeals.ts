import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user preferences
        const preferences = await base44.entities.UserPreferences.filter({ created_by: user.email });
        
        if (!preferences || preferences.length === 0) {
            return Response.json({ 
                error: 'User preferences not found. Please complete your profile first.' 
            }, { status: 400 });
        }

        const userPrefs = preferences[0];
        const { count = 5 } = await req.json().catch(() => ({ count: 5 }));

        const prompt = `You are an expert investment sourcing specialist with deep market knowledge.

Proactively identify and source NEW investment deal opportunities that align perfectly with this investor's profile:

INVESTOR PROFILE:
- Income Goal: ${userPrefs.passive_income_goal || 'passive income generation'}
- Risk Tolerance: ${userPrefs.risk_tolerance || 'moderate'}
- Time Horizon: ${userPrefs.time_horizon || 'medium_term'}
- Target Industries: ${userPrefs.target_industries?.join(', ') || 'diversified'}
- Investment Range: $${userPrefs.investment_size_min || 0} - $${userPrefs.investment_size_max || 100000}
- Preferred Deal Structures: ${userPrefs.preferred_deal_structures?.join(', ') || 'equity, revenue share'}
- Skills: ${userPrefs.existing_skills?.join(', ') || 'general business'}
- Time Commitment: ${userPrefs.time_commitment || 'flexible'} hours/week

Source ${count} SPECIFIC, ACTIONABLE investment opportunities from current market conditions. Focus on:
1. Real, emerging opportunities in their target sectors
2. Deals that match their investment size and structure preferences
3. Opportunities that leverage their existing skills
4. Clear paths to their income goals

For each deal, provide comprehensive details including how to access/pursue the opportunity.`;

        const result = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    opportunities: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                industry: { type: "string" },
                                summary: { type: "string" },
                                description: { type: "string" },
                                estimated_value: { type: "number" },
                                estimated_roi: { type: "number" },
                                time_to_roi: { type: "string" },
                                risk_score: { type: "number", minimum: 1, maximum: 10 },
                                match_score: { type: "number", minimum: 0, maximum: 100 },
                                key_opportunities: { type: "array", items: { type: "string" } },
                                key_risks: { type: "array", items: { type: "string" } },
                                how_to_pursue: { type: "string" },
                                required_investment: { type: "number" },
                                deal_structure: { type: "string" },
                                source_url: { type: "string" }
                            },
                            required: ["title", "industry", "summary", "description"]
                        }
                    },
                    market_context: {
                        type: "string",
                        description: "Brief market context for these opportunities"
                    }
                },
                required: ["opportunities"]
            }
        });

        // Save new opportunities to database
        const savedDeals = [];
        for (const opp of result.opportunities) {
            const deal = await base44.entities.SourcedDealOpportunity.create({
                ...opp,
                source: 'ai_generated',
                status: 'pending',
                is_generated: true,
                generated_at: new Date().toISOString()
            });
            savedDeals.push(deal);
        }

        return Response.json({
            success: true,
            opportunities: savedDeals,
            market_context: result.market_context,
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error sourcing deals:', error);
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});