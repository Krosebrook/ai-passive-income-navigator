import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { sectors = [], timeframe = '3_months' } = await req.json();

        const prompt = `Analyze current market trends for these sectors: ${sectors.join(', ')}

Timeframe: ${timeframe}

Provide:
1. Key market movements
2. Emerging opportunities
3. Risk factors
4. Investment sentiment
5. Growth predictions`;

        const analysis = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    trends: { type: "array", items: { type: "string" } },
                    opportunities: { type: "array", items: { type: "string" } },
                    risks: { type: "array", items: { type: "string" } },
                    sentiment: { type: "string" }
                }
            }
        });

        return Response.json({ success: true, analysis });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});