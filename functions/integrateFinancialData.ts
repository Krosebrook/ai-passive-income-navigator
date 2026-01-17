import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { endpoint, symbols = [], dataType = 'quote' } = await req.json();

        // Fetch financial data from Finnhub
        const finnhubKey = Deno.env.get('FINNHUB_API_KEY');
        if (!finnhubKey) return Response.json({ error: 'Finnhub not configured' }, { status: 400 });

        const results = {};
        
        for (const symbol of symbols) {
            const url = `https://finnhub.io/api/v1/${endpoint}?symbol=${symbol}&token=${finnhubKey}`;
            const response = await fetch(url);
            const data = await response.json();
            results[symbol] = data;
        }

        return Response.json({ success: true, data: results });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});