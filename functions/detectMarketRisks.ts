import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user data
        const preferences = await base44.entities.UserPreferences.filter({ created_by: user.email });
        const portfolioIdeas = await base44.entities.PortfolioIdea.filter({ created_by: user.email });
        const deals = await base44.entities.SourcedDealOpportunity.filter({ created_by: user.email });

        if (!preferences || preferences.length === 0) {
            return Response.json({ 
                error: 'User preferences not found.' 
            }, { status: 400 });
        }

        const userPrefs = preferences[0];

        // Get user's industries and categories
        const userIndustries = [...new Set([
            ...(userPrefs.target_industries || []),
            ...portfolioIdeas.map(i => i.category).filter(Boolean),
            ...deals.map(d => d.industry).filter(Boolean)
        ])];

        const prompt = `You are a financial risk analyst and market monitoring expert.

Analyze current market conditions and identify potential risks and opportunities for this investor:

INVESTOR EXPOSURE:
- Risk Tolerance: ${userPrefs.risk_tolerance || 'moderate'}
- Industries/Categories: ${userIndustries.join(', ') || 'diversified'}
- Active Portfolio Items: ${portfolioIdeas.length}
- Active Deals: ${deals.filter(d => d.status !== 'dismissed').length}
- Diversification: ${userPrefs.diversification_preference || 'moderately_diversified'}

Analyze current market conditions and identify:
1. Critical market shifts that could impact their portfolio
2. Industry-specific risks in their exposure areas
3. Emerging opportunities they should consider
4. Recommended immediate actions (if any)

Focus on actionable, high-priority alerts only.`;

        const result = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    critical_alerts: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                severity: { type: "string", enum: ["high", "medium", "low"] },
                                description: { type: "string" },
                                affected_areas: { type: "array", items: { type: "string" } },
                                recommended_action: { type: "string" },
                                timeframe: { type: "string" }
                            }
                        }
                    },
                    market_shifts: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                shift: { type: "string" },
                                impact: { type: "string" },
                                relevance_score: { type: "number", description: "0-100" }
                            }
                        }
                    },
                    opportunities: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                opportunity: { type: "string" },
                                potential_impact: { type: "string" },
                                action_required: { type: "string" }
                            }
                        }
                    },
                    overall_risk_level: {
                        type: "string",
                        enum: ["low", "moderate", "elevated", "high"],
                        description: "Overall portfolio risk assessment"
                    }
                },
                required: ["critical_alerts", "overall_risk_level"]
            }
        });

        // Store high-severity alerts
        for (const alert of result.critical_alerts || []) {
            if (alert.severity === 'high' || alert.severity === 'medium') {
                await base44.entities.InvestmentAlert.create({
                    title: alert.title,
                    description: alert.description,
                    severity: alert.severity,
                    alert_type: 'market_risk',
                    affected_areas: alert.affected_areas,
                    recommended_action: alert.recommended_action,
                    status: 'active',
                    generated_at: new Date().toISOString()
                });
            }
        }

        return Response.json({
            success: true,
            analysis: result,
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error detecting market risks:', error);
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});