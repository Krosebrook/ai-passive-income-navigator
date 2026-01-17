import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { platforms = [], query, filters = {} } = await req.json();

        const searchPrompt = `Search for deal opportunities on ${platforms.join(', ')} matching: ${query}
        
Filters: ${JSON.stringify(filters)}

Return structured data with: title, description, price, roi, source, link, key_metrics`;

        const results = await base44.integrations.Core.InvokeLLM({
            prompt: searchPrompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    deals: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                source: { type: "string" },
                                url: { type: "string" },
                                price: { type: "number" },
                                roi: { type: "number" }
                            }
                        }
                    }
                }
            }
        });

        return Response.json({ success: true, deals: results.deals || [] });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});