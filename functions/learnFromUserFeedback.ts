import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dealId, dealTitle, feedbackType, reasons, customFeedback, matchScore } = await req.json();

    if (!dealId || !feedbackType || !reasons || reasons.length === 0) {
      return Response.json({ 
        error: 'dealId, feedbackType, and reasons are required' 
      }, { status: 400 });
    }

    // Fetch the deal to get metadata
    const deals = await base44.entities.SourcedDealOpportunity.filter({ id: dealId });
    const deal = deals[0];

    if (!deal) {
      return Response.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Store the feedback
    await base44.entities.AIDealsUserFeedback.create({
      deal_id: dealId,
      deal_title: dealTitle,
      action: feedbackType === 'good' ? 'good_match' : 'bad_match',
      feedback_type: feedbackType,
      feedback_reasons: reasons,
      custom_feedback: customFeedback,
      match_score: matchScore,
      deal_metadata: {
        industry: deal.industry,
        deal_structure: deal.deal_structure,
        required_investment: deal.required_investment,
        risk_score: deal.risk_score,
        estimated_roi: deal.estimated_roi
      }
    });

    // Get user's current preferences
    const prefs = await base44.entities.UserPreferences.filter({ 
      created_by: user.email 
    });
    const userPrefs = prefs[0];

    // Fetch all feedback history for this user
    const allFeedback = await base44.entities.AIDealsUserFeedback.filter({
      created_by: user.email
    });

    // Use AI to analyze patterns and suggest preference updates
    const analysisPrompt = `You are an AI learning system that improves deal matching based on user feedback.

**User's Current Preferences:**
- Risk Tolerance: ${userPrefs?.risk_tolerance || 'moderate'}
- Investment Range: $${userPrefs?.investment_size_min || 0} - $${userPrefs?.investment_size_max || 0}
- Target Industries: ${userPrefs?.target_industries?.join(', ') || 'None set'}
- Preferred Deal Structures: ${userPrefs?.preferred_deal_structures?.join(', ') || 'None set'}
- Target Return: ${userPrefs?.target_return_percentage || 0}%

**Latest Feedback:**
- Deal: ${dealTitle}
- Type: ${feedbackType} match
- Reasons: ${reasons.join(', ')}
- Custom Feedback: ${customFeedback || 'None'}
- Deal Industry: ${deal.industry}
- Deal Structure: ${deal.deal_structure || 'N/A'}
- Investment Required: $${deal.required_investment || 'N/A'}
- Risk Score: ${deal.risk_score}/10

**Historical Feedback Summary:**
- Total Good Matches: ${allFeedback.filter(f => f.feedback_type === 'good').length}
- Total Bad Matches: ${allFeedback.filter(f => f.feedback_type === 'bad').length}

Based on this feedback, provide:
1. Key insights about what the user values or dislikes
2. Specific preference adjustments to improve future matching (be conservative, don't overreact to single feedback)
3. Industries or deal structures to prioritize or avoid
4. Investment size or risk tolerance adjustments if needed`;

    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          insights: {
            type: 'array',
            items: { type: 'string' },
            description: 'Key insights from feedback'
          },
          preference_adjustments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                current_value: { type: 'string' },
                suggested_value: { type: 'string' },
                reason: { type: 'string' }
              }
            },
            description: 'Suggested preference updates'
          },
          industries_to_prioritize: {
            type: 'array',
            items: { type: 'string' }
          },
          industries_to_avoid: {
            type: 'array',
            items: { type: 'string' }
          },
          matching_tips: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tips for improving future matches'
          }
        },
        required: ['insights', 'preference_adjustments', 'matching_tips']
      }
    });

    return Response.json({
      success: true,
      feedback_recorded: true,
      ai_learning: aiAnalysis,
      message: 'Thank you! AI will use this feedback to improve your deal matches.'
    });

  } catch (error) {
    console.error('Feedback learning error:', error);
    return Response.json({ 
      error: error.message || 'Failed to process feedback' 
    }, { status: 500 });
  }
});