import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Analyzes submitted success stories to extract themes, strategies, and challenges
 * Provides aggregated insights for the community
 * 
 * @param {string} ideaCategory - Category to analyze stories for
 * @param {array} stories - Array of success stories to analyze
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ideaCategory, stories } = await req.json();

    const storiesText = stories.map(s => 
      `Story: ${s.story_title}\nSummary: ${s.story_summary}\nStrategies: ${s.key_strategies?.join(', ')}\nChallenges: ${s.challenges_faced?.join(', ')}\nLessons: ${s.lessons_learned?.join(', ')}\nMonthly Revenue: $${s.current_monthly_revenue}\nTime to Profit: ${s.time_to_profit_months} months`
    ).join('\n---\n');

    const prompt = `Analyze these ${ideaCategory} success stories and extract community insights:

${storiesText}

Provide a comprehensive community analysis with:

{
  "common_success_patterns": ["pattern1", "pattern2"],
  "most_effective_strategies": [
    {
      "strategy": "string",
      "frequency": "percentage of stories using this",
      "impact": "high|medium|low"
    }
  ],
  "most_common_challenges": [
    {
      "challenge": "string",
      "frequency": "percentage",
      "solutions": ["solution1", "solution2"]
    }
  ],
  "key_success_factors": [
    {
      "factor": "string",
      "importance": "critical|important|helpful"
    }
  ],
  "average_metrics": {
    "avg_time_to_profit_months": number,
    "avg_initial_investment": number,
    "avg_monthly_revenue": number,
    "avg_roi_percentage": number
  },
  "timeline_insights": "text about typical journey progression",
  "investment_vs_return_analysis": "analysis of capital requirements vs income potential",
  "mistake_patterns": ["mistake1", "mistake2"],
  "community_recommendations": ["recommendation1", "recommendation2"],
  "success_probability": "low|medium|high",
  "difficulty_assessment": "beginner|intermediate|advanced"
}`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          common_success_patterns: { type: 'array', items: { type: 'string' } },
          most_effective_strategies: { type: 'array', items: { type: 'object' } },
          most_common_challenges: { type: 'array', items: { type: 'object' } },
          key_success_factors: { type: 'array', items: { type: 'object' } },
          average_metrics: { type: 'object' },
          timeline_insights: { type: 'string' },
          investment_vs_return_analysis: { type: 'string' },
          mistake_patterns: { type: 'array', items: { type: 'string' } },
          community_recommendations: { type: 'array', items: { type: 'string' } },
          success_probability: { type: 'string' },
          difficulty_assessment: { type: 'string' }
        }
      }
    });

    return Response.json(analysis);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});