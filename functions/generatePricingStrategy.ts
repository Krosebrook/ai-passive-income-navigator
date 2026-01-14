import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ideaTitle, description, targetAudience, productType } = await req.json();

    const prompt = `Generate a comprehensive AI-driven pricing strategy for this passive income idea:

Title: ${ideaTitle}
Description: ${description}
Target Audience: ${targetAudience}
Product Type: ${productType}

Provide:
1. Recommended base price and price range with justification
2. Multiple pricing tiers/models (entry, professional, premium)
3. Psychological pricing tactics for each tier
4. Competitor pricing analysis recommendations
5. Revenue projections based on different pricing scenarios
6. Launch pricing strategy (introductory vs standard pricing)
7. Upsell and cross-sell opportunities
8. Price optimization tips based on market conditions

Return JSON with structure:
{
  "recommended_price": {
    "base_price": number,
    "price_range": {
      "min": number,
      "max": number
    },
    "justification": "string"
  },
  "pricing_tiers": [
    {
      "name": "string",
      "price": number,
      "features": ["feature1", "feature2"],
      "target_customer": "string",
      "monthly_revenue_potential": "string"
    }
  ],
  "psychological_tactics": ["tactic1", "tactic2"],
  "revenue_projections": {
    "conservative": "string (e.g., '$5,000/month at 10% conversion')",
    "moderate": "string (e.g., '$15,000/month at 25% conversion')",
    "optimistic": "string (e.g., '$30,000/month at 50% conversion')"
  },
  "launch_strategy": {
    "intro_price": number,
    "promo_duration": "string",
    "standard_price": number,
    "expected_boost": "string"
  },
  "upsell_opportunities": [
    {
      "name": "string",
      "price": number,
      "description": "string"
    }
  ],
  "optimization_tips": ["tip1", "tip2"],
  "competitor_positioning": "string"
}`;

    const strategy = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          recommended_price: { type: 'object' },
          pricing_tiers: { type: 'array', items: { type: 'object' } },
          psychological_tactics: { type: 'array', items: { type: 'string' } },
          revenue_projections: { type: 'object' },
          launch_strategy: { type: 'object' },
          upsell_opportunities: { type: 'array', items: { type: 'object' } },
          optimization_tips: { type: 'array', items: { type: 'string' } },
          competitor_positioning: { type: 'string' }
        }
      }
    });

    return Response.json(strategy);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});