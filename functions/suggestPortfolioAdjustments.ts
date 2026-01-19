import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user preferences and current portfolio
        const preferences = await base44.entities.UserPreferences.filter({ created_by: user.email });
        const portfolioIdeas = await base44.entities.PortfolioIdea.filter({ created_by: user.email });
        const deals = await base44.entities.SourcedDealOpportunity.filter({ created_by: user.email });

        if (!preferences || preferences.length === 0) {
            return Response.json({ 
                error: 'User preferences not found. Please complete your profile first.' 
            }, { status: 400 });
        }

        const userPrefs = preferences[0];

        // Prepare portfolio summary
        const portfolioSummary = {
            total_ideas: portfolioIdeas.length,
            by_status: {
                exploring: portfolioIdeas.filter(i => i.status === 'exploring').length,
                planning: portfolioIdeas.filter(i => i.status === 'planning').length,
                in_progress: portfolioIdeas.filter(i => i.status === 'in_progress').length,
                launched: portfolioIdeas.filter(i => i.status === 'launched').length
            },
            categories: [...new Set(portfolioIdeas.map(i => i.category).filter(Boolean))],
            active_deals: deals.filter(d => d.status !== 'dismissed').length
        };

        // Craft comprehensive prompt for portfolio analysis
        const prompt = `You are an expert investment portfolio advisor and wealth management consultant.

Analyze this user's portfolio and provide actionable rebalancing recommendations:

USER PROFILE:
- Risk Tolerance: ${userPrefs.risk_tolerance || 'moderate'}
- Time Horizon: ${userPrefs.time_horizon || 'medium_term'}
- Target Return: ${userPrefs.target_return_percentage || 'N/A'}%
- Diversification Preference: ${userPrefs.diversification_preference || 'moderately_diversified'}
- Target Industries: ${userPrefs.target_industries?.join(', ') || 'Not specified'}
- Investment Size Range: $${userPrefs.investment_size_min || 0} - $${userPrefs.investment_size_max || 'unlimited'}
- Preferred Deal Structures: ${userPrefs.preferred_deal_structures?.join(', ') || 'Not specified'}

CURRENT PORTFOLIO:
- Total Ideas: ${portfolioSummary.total_ideas}
- Status Breakdown: ${JSON.stringify(portfolioSummary.by_status)}
- Categories: ${portfolioSummary.categories.join(', ') || 'None'}
- Active Deals: ${portfolioSummary.active_deals}

Based on current market conditions, economic trends, and the user's goals, provide:

1. Specific portfolio rebalancing recommendations (e.g., "Increase tech exposure by 15%", "Reduce real estate holdings")
2. Clear rationale for each recommendation
3. Suggested target allocation percentages
4. Specific actions to take (acquire, divest, reallocate)
5. Risk assessment of current vs. recommended portfolio
6. Timeline for implementing changes

Consider current market conditions, sector performance, and alignment with user's stated goals.`;

        const result = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    overall_assessment: {
                        type: "string",
                        description: "Overall portfolio assessment"
                    },
                    recommendations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                action: {
                                    type: "string",
                                    description: "Specific action (e.g., 'increase', 'reduce', 'acquire', 'divest')"
                                },
                                category: {
                                    type: "string",
                                    description: "Investment category or asset class"
                                },
                                percentage: {
                                    type: "number",
                                    description: "Percentage change recommended"
                                },
                                rationale: {
                                    type: "string",
                                    description: "Why this adjustment is recommended"
                                },
                                priority: {
                                    type: "string",
                                    enum: ["high", "medium", "low"],
                                    description: "Priority level"
                                },
                                timeline: {
                                    type: "string",
                                    description: "Suggested timeline for implementation"
                                }
                            }
                        }
                    },
                    target_allocation: {
                        type: "object",
                        description: "Recommended target allocation percentages by category",
                        additionalProperties: true
                    },
                    risk_analysis: {
                        type: "object",
                        properties: {
                            current_risk_level: {
                                type: "string"
                            },
                            recommended_risk_level: {
                                type: "string"
                            },
                            notes: {
                                type: "string"
                            }
                        }
                    },
                    market_context: {
                        type: "string",
                        description: "Current market conditions influencing these recommendations"
                    }
                },
                required: ["overall_assessment", "recommendations", "target_allocation"]
            }
        });

        // Store the suggestion in the database
        const suggestion = await base44.entities.PortfolioAdjustmentSuggestion.create({
            overall_assessment: result.overall_assessment,
            recommendations: result.recommendations,
            target_allocation: result.target_allocation,
            risk_analysis: result.risk_analysis,
            market_context: result.market_context,
            status: 'pending',
            generated_at: new Date().toISOString()
        });

        return Response.json({
            success: true,
            suggestion_id: suggestion.id,
            data: result
        });

    } catch (error) {
        console.error('Error generating portfolio adjustments:', error);
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});