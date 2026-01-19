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
        const financialData = await base44.entities.FinancialData.filter({ created_by: user.email }, '-date', 100);

        if (!preferences || preferences.length === 0) {
            return Response.json({ 
                error: 'User preferences not found. Please complete your profile first.' 
            }, { status: 400 });
        }

        const userPrefs = preferences[0];

        // Calculate portfolio metrics
        const totalRevenue = financialData.reduce((sum, d) => sum + (d.revenue || 0), 0);
        const totalExpenses = financialData.reduce((sum, d) => sum + (d.expenses || 0), 0);
        const totalProfit = totalRevenue - totalExpenses;

        const prompt = `You are an expert investment strategist and wealth advisor.

Analyze this investor's profile and provide a comprehensive, personalized investment strategy:

INVESTOR PROFILE:
- Income Goal: ${userPrefs.passive_income_goal || 'Not specified'}
- Risk Tolerance: ${userPrefs.risk_tolerance || 'moderate'}
- Time Horizon: ${userPrefs.time_horizon || 'medium_term'}
- Target Return: ${userPrefs.target_return_percentage || 'N/A'}% annually
- Time Commitment: ${userPrefs.time_commitment || 'N/A'} hours/week
- Diversification: ${userPrefs.diversification_preference || 'moderately_diversified'}
- Existing Skills: ${userPrefs.existing_skills?.join(', ') || 'Not specified'}

CURRENT PORTFOLIO:
- Active Ideas: ${portfolioIdeas.length}
- Active Deals: ${deals.filter(d => d.status !== 'dismissed').length}
- Total Revenue (tracked): $${totalRevenue.toFixed(2)}
- Total Profit: $${totalProfit.toFixed(2)}

MARKET CONTEXT: Use current market conditions, economic outlook, and industry trends.

Provide a comprehensive investment strategy including:
1. Overall strategic direction aligned with their goals
2. Specific asset allocation recommendations
3. Short-term (3-6 months) actionable steps
4. Long-term (1-3 years) strategic milestones
5. Risk management tactics
6. Growth opportunities specific to their profile
7. Key metrics to track for success`;

        const result = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    strategic_direction: {
                        type: "string",
                        description: "Overall strategic direction and vision"
                    },
                    asset_allocation: {
                        type: "object",
                        properties: {
                            recommended_categories: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        category: { type: "string" },
                                        percentage: { type: "number" },
                                        rationale: { type: "string" }
                                    }
                                }
                            }
                        }
                    },
                    short_term_actions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                action: { type: "string" },
                                priority: { type: "string", enum: ["high", "medium", "low"] },
                                timeline: { type: "string" },
                                expected_impact: { type: "string" }
                            }
                        }
                    },
                    long_term_milestones: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                milestone: { type: "string" },
                                timeframe: { type: "string" },
                                success_criteria: { type: "string" }
                            }
                        }
                    },
                    risk_management: {
                        type: "object",
                        properties: {
                            key_risks: { type: "array", items: { type: "string" } },
                            mitigation_strategies: { type: "array", items: { type: "string" } }
                        }
                    },
                    growth_opportunities: {
                        type: "array",
                        items: { type: "string" }
                    },
                    success_metrics: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                metric: { type: "string" },
                                target_value: { type: "string" },
                                tracking_frequency: { type: "string" }
                            }
                        }
                    }
                },
                required: ["strategic_direction", "short_term_actions", "long_term_milestones"]
            }
        });

        return Response.json({
            success: true,
            strategy: result,
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error generating investment strategy:', error);
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});