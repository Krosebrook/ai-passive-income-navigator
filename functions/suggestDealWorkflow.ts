import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { dealId } = await req.json();

        if (!dealId) {
            return Response.json({ error: 'dealId is required' }, { status: 400 });
        }

        // Fetch deal details
        const deal = await base44.entities.DealPipeline.get(dealId);
        if (!deal) {
            return Response.json({ error: 'Deal not found' }, { status: 404 });
        }

        // Fetch user preferences for personalization
        const userPrefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
        const prefs = userPrefs[0] || {};

        // Build AI prompt
        const prompt = `You are an expert in deal management and nurturing workflows. Generate an optimal automated workflow for the following deal:

Deal Name: ${deal.deal_name}
Description: ${deal.deal_description || 'N/A'}
Current Stage: ${deal.stage}
Priority: ${deal.priority}
Estimated Value: $${deal.estimated_value || 'N/A'}

User Preferences:
- Risk Tolerance: ${prefs.risk_tolerance || 'moderate'}
- Time Commitment: ${prefs.time_commitment || 'medium'}
- Target Industries: ${prefs.target_industries?.join(', ') || 'N/A'}

Generate a comprehensive deal nurturing workflow with the following:

1. **Workflow Stages**: List the typical stages this deal should go through (e.g., initial_contact, follow_up, evaluation, negotiation, closing)

2. **Scheduled Actions**: For each stage, provide 3-5 specific actions with:
   - action_type: (email, reminder, task, research, call)
   - relative_timing: (e.g., "within_24h", "day_3", "week_1", "week_2")
   - action_description: Specific, actionable description
   - email_template: If action_type is "email", provide a professional, personalized email template

3. **AI Recommended Next Steps**: Based on the current stage (${deal.stage}), what are the immediate next 3 actions to take?

4. **Content Suggestions**: Provide 2-3 key talking points or research topics relevant to this deal

Return the response as a structured JSON object.`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    workflow_stages: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                stage: { type: "string" },
                                description: { type: "string" },
                                actions: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            action_type: { type: "string" },
                                            relative_timing: { type: "string" },
                                            action_description: { type: "string" },
                                            email_template: { type: "string" }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    immediate_next_steps: {
                        type: "array",
                        items: { type: "string" }
                    },
                    content_suggestions: {
                        type: "array",
                        items: { type: "string" }
                    },
                    engagement_tips: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        return Response.json({
            success: true,
            workflow: response,
            deal_info: {
                name: deal.deal_name,
                stage: deal.stage,
                priority: deal.priority
            }
        });

    } catch (error) {
        console.error('Error generating workflow:', error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});