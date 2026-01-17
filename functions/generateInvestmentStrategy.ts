import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user data
        const userPrefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
        const prefs = userPrefs[0];

        const portfolioIdeas = await base44.entities.PortfolioIdea.filter({ created_by: user.email });
        const performanceReports = await base44.entities.PerformanceReport.filter({ created_by: user.email });
        const latestReport = performanceReports[0];

        if (!prefs) {
            return Response.json({ error: 'Please complete onboarding first' }, { status: 400 });
        }

        // Build comprehensive strategy prompt
        const portfolioSummary = portfolioIdeas.length > 0
            ? `Current portfolio has ${portfolioIdeas.length} active ideas with sectors: ${
                [...new Set(portfolioIdeas.map(p => p.category))].join(', ')
              }`
            : 'User is just starting their portfolio';

        const performanceSummary = latestReport
            ? `Recent performance: Total profit $${latestReport.portfolio_summary.total_profit || 0}, ROI ${latestReport.portfolio_summary.overall_roi || 0}%`
            : 'No performance data yet';

        const prompt = `You are an expert investment advisor specializing in passive income. Provide comprehensive investment strategy advice for:

User Profile:
- Passive Income Goal: ${prefs.passive_income_goal}
- Time Commitment: ${prefs.time_commitment} hours/week
- Risk Tolerance: ${prefs.risk_tolerance}
- Target Return: ${prefs.target_return_percentage}% annually
- Time Horizon: ${prefs.time_horizon}
- Diversification Preference: ${prefs.diversification_preference}
- Preferred Sectors: ${prefs.sector_priorities?.join(', ') || 'all'}
- Asset Classes: ${prefs.asset_class_priorities?.join(', ') || 'all'}

Portfolio Status:
${portfolioSummary}
${performanceSummary}

Provide strategic advice in the following areas:

1. **Portfolio Rebalancing Strategy**:
   - Current allocation analysis (if applicable)
   - Recommended reallocation for optimal risk-adjusted returns
   - Specific actions to take (buy/sell/hold)
   - Timeline for rebalancing

2. **Market Trends & Opportunities**:
   - Top 3 emerging trends relevant to their sectors
   - Specific opportunities in high-growth industries
   - Market headwinds to watch
   - Best timing for investments

3. **Risk Assessment**:
   - Current portfolio concentration risks (if any)
   - Correlation risks between holdings
   - External market risks (economic, regulatory)
   - Mitigation strategies

4. **Immediate Action Items**:
   - Top 3 priorities for the next 30 days
   - Quick wins for income improvement
   - Areas needing due diligence

5. **12-Month Roadmap**:
   - Strategic milestones
   - Expected portfolio growth
   - Diversification targets
   - Tax optimization opportunities

Return response as structured JSON with these exact sections.`;

        const strategy = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    portfolio_rebalancing: {
                        type: "object",
                        properties: {
                            analysis: { type: "string" },
                            recommendations: { type: "array", items: { type: "string" } },
                            timeline: { type: "string" }
                        }
                    },
                    market_trends: {
                        type: "object",
                        properties: {
                            emerging_trends: { type: "array", items: { type: "string" } },
                            opportunities: { type: "array", items: { type: "string" } },
                            headwinds: { type: "array", items: { type: "string" } }
                        }
                    },
                    risk_assessment: {
                        type: "object",
                        properties: {
                            concentration_risks: { type: "array", items: { type: "string" } },
                            external_risks: { type: "array", items: { type: "string" } },
                            mitigations: { type: "array", items: { type: "string" } }
                        }
                    },
                    immediate_actions: {
                        type: "array",
                        items: { type: "string" }
                    },
                    twelve_month_roadmap: {
                        type: "object",
                        properties: {
                            milestones: { type: "array", items: { type: "string" } },
                            expected_growth: { type: "string" },
                            diversification_targets: { type: "array", items: { type: "string" } }
                        }
                    }
                }
            }
        });

        return Response.json({
            success: true,
            strategy: strategy,
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error generating strategy:', error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});