import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { deal_id, auto_categorize_all } = await req.json();

        // Get user's historical feedback for learning
        const feedbackHistory = await base44.entities.AIDealsUserFeedback.filter({ 
            created_by: user.email 
        });

        // Get user preferences
        const prefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
        const userPrefs = prefs[0] || {};

        // Get deals to categorize
        const deals = deal_id 
            ? await base44.entities.SourcedDealOpportunity.filter({ id: deal_id })
            : await base44.entities.SourcedDealOpportunity.filter({ status: 'pending' });

        if (deals.length === 0) {
            return Response.json({ error: 'No deals to categorize' }, { status: 404 });
        }

        // Analyze feedback patterns
        const positivePatterns = feedbackHistory
            .filter(f => f.feedback_type === 'good')
            .map(f => f.deal_metadata);
        
        const negativePatterns = feedbackHistory
            .filter(f => f.feedback_type === 'bad')
            .map(f => f.deal_metadata);

        const categorizedDeals = [];

        for (const deal of deals) {
            // AI-driven categorization
            const categorizationPrompt = `
Analyze this investment deal and categorize it based on user preferences and historical feedback.

DEAL:
- Title: ${deal.title}
- Industry: ${deal.industry}
- Summary: ${deal.summary}
- Investment Required: $${deal.required_investment?.toLocaleString()}
- Deal Structure: ${deal.deal_structure}
- Opportunities: ${deal.key_opportunities?.join(', ')}
- Risks: ${deal.key_risks?.join(', ')}

USER PREFERENCES:
- Target Industries: ${userPrefs.target_industries?.join(', ') || 'not specified'}
- Risk Tolerance: ${userPrefs.risk_tolerance || 'moderate'}
- Investment Range: $${userPrefs.investment_size_min || 0} - $${userPrefs.investment_size_max || 'unlimited'}
- Deal Structures: ${userPrefs.preferred_deal_structures?.join(', ') || 'not specified'}
- Time Horizon: ${userPrefs.time_horizon || 'medium_term'}

HISTORICAL PATTERNS:
Deals user liked: ${positivePatterns.length} deals with common traits
Deals user rejected: ${negativePatterns.length} deals with common traits

Provide:
1. primary_category (string): Best category (high_priority, good_fit, potential, watch_list, pass)
2. category_confidence (0-100): Confidence in this categorization
3. reasoning (string): Why this category was chosen
4. tags (array): Relevant tags (e.g., "early_stage", "high_growth", "passive_income")
5. attention_priority (1-5): How urgently user should review (5 = immediate)
6. personalization_score (0-100): How well this fits user's unique profile
7. similar_to_past (array): IDs or titles of similar deals user interacted with

Return as JSON.`;

            const categorization = await base44.integrations.Core.InvokeLLM({
                prompt: categorizationPrompt,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        primary_category: { type: 'string' },
                        category_confidence: { type: 'number' },
                        reasoning: { type: 'string' },
                        tags: { type: 'array', items: { type: 'string' } },
                        attention_priority: { type: 'number' },
                        personalization_score: { type: 'number' },
                        similar_to_past: { type: 'array', items: { type: 'string' } }
                    }
                }
            });

            // Update deal with categorization
            await base44.entities.SourcedDealOpportunity.update(deal.id, {
                match_score: categorization.personalization_score,
                prediction_confidence: categorization.category_confidence
            });

            categorizedDeals.push({
                deal_id: deal.id,
                title: deal.title,
                categorization
            });
        }

        return Response.json({
            success: true,
            deals_categorized: categorizedDeals.length,
            categorizations: categorizedDeals
        });

    } catch (error) {
        console.error('Error categorizing deals:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});