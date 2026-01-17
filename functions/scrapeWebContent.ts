import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { url, format = 'markdown' } = await req.json();
        const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
        
        if (!firecrawlKey) return Response.json({ error: 'Firecrawl not configured' }, { status: 400 });
        if (!url) return Response.json({ error: 'URL required' }, { status: 400 });

        const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${firecrawlKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                formats: [format]
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Scraping failed');

        return Response.json({ success: true, data: data.data });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});