import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category } = await req.json();

    const categoryPrompts = {
      opportunities: `Analyze current market opportunities for passive income in 2026. Research emerging niches and growing markets.
      
Provide detailed analysis including:
1. Top 5 emerging opportunities (describe growth trajectory, market size, timeline to profitability)
2. Market data points (growth rates, revenue potential, target audience size)
3. Why these are gaining traction now
4. Competition level for each opportunity
5. Investment requirements and barriers to entry

Return JSON with structure:
{
  "opportunities": [
    {
      "name": "string",
      "description": "string",
      "growth_rate": "string (e.g., '+45% YoY')",
      "market_size": "string",
      "profitability_timeline": "string",
      "competition": "low|moderate|high",
      "investment_required": "string",
      "key_insight": "string"
    }
  ],
  "market_summary": "string"
}`,

      niches: `Identify emerging and underrated passive income niches for 2026.
      
Find niches that are:
- Growing but not saturated
- Have passionate audiences
- Generate consistent revenue
- Less competitive than mainstream options

For each niche provide:
1. Niche name and description
2. Estimated market size
3. Growth indicators
4. How to enter the niche (costs and skills)
5. Revenue models
6. Key players and competition
7. 12-month growth forecast

Return JSON with structure:
{
  "niches": [
    {
      "name": "string",
      "description": "string",
      "market_size": "string",
      "growth_indicators": ["indicator1", "indicator2"],
      "entry_cost": "string",
      "revenue_models": ["model1", "model2"],
      "competition_level": "low|moderate|high",
      "growth_forecast": "string",
      "best_for": "string"
    }
  ],
  "niche_insights": "string"
}`,

      technologies: `Analyze trending technologies and tools that creators/entrepreneurs should learn in 2026 for passive income.
      
Focus on:
- AI tools gaining adoption
- Automation platforms
- No-code/low-code solutions
- Emerging platforms
- Investment in these tools vs ROI

For each technology:
1. Name and use case
2. Why it's trending
3. Passive income applications
4. Learning curve
5. Cost to get started
6. Revenue potential
7. Market demand forecast

Return JSON with structure:
{
  "trending_technologies": [
    {
      "name": "string",
      "category": "AI|Automation|No-Code|Platform|Other",
      "use_cases": ["use_case1", "use_case2"],
      "adoption_trend": "string (e.g., '+200% adoption')",
      "learning_difficulty": "easy|moderate|hard",
      "startup_cost": "string",
      "revenue_potential": "string",
      "market_demand": "string",
      "recommendation": "string"
    }
  ],
  "tech_summary": "string"
}`,

      consumer: `Analyze shifting consumer behaviors and preferences affecting passive income opportunities.
      
Research:
- How consumer preferences are evolving
- Willingness to spend on digital products
- Emerging consumer segments
- Content consumption trends
- Purchasing decision factors

Provide:
1. Key behavioral shifts
2. Consumer segments with high spending power
3. Emerging demands
4. Platform preferences
5. Content format preferences
6. Pricing sensitivity by segment

Return JSON with structure:
{
  "behavioral_shifts": ["shift1", "shift2"],
  "high_value_segments": [
    {
      "segment": "string",
      "size": "string",
      "characteristics": ["char1", "char2"],
      "spending_capacity": "string",
      "preferred_formats": ["format1", "format2"],
      "pain_points": ["pain1", "pain2"]
    }
  ],
  "platform_preferences": {
    "platform": "adoption_trend_string"
  },
  "content_trends": ["trend1", "trend2"],
  "consumer_insights": "string"
}`
    };

    const prompt = categoryPrompts[category] || categoryPrompts.opportunities;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          opportunities: {
            type: 'array',
            items: { type: 'object' }
          },
          niches: {
            type: 'array',
            items: { type: 'object' }
          },
          trending_technologies: {
            type: 'array',
            items: { type: 'object' }
          },
          behavioral_shifts: {
            type: 'array',
            items: { type: 'string' }
          },
          high_value_segments: {
            type: 'array',
            items: { type: 'object' }
          },
          market_summary: { type: 'string' },
          niche_insights: { type: 'string' },
          tech_summary: { type: 'string' },
          consumer_insights: { type: 'string' },
          platform_preferences: { type: 'object' }
        }
      }
    });

    return Response.json(analysis);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});