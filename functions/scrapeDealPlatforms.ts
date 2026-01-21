import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user preferences for targeting
        const prefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
        const userPrefs = prefs[0] || {};

        const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
        const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

        if (!FIRECRAWL_API_KEY || !PERPLEXITY_API_KEY) {
            return Response.json({ 
                error: 'API keys not configured',
                deals: []
            }, { status: 500 });
        }

        // Step 1: Use Perplexity to find relevant deal platforms and listings
        const industries = userPrefs.target_industries?.join(', ') || 'technology, real estate, startups';
        const searchQuery = `Find active investment opportunities and deals in ${industries} that are currently available. Include platforms like AngelList, Crunchbase, and other deal sourcing platforms.`;

        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-sonar-large-128k-online',
                messages: [{
                    role: 'user',
                    content: searchQuery
                }],
                return_citations: true,
                search_domain_filter: ['angellist.com', 'crunchbase.com', 'seedrs.com', 'crowdcube.com']
            })
        });

        if (!perplexityResponse.ok) {
            throw new Error('Perplexity API error');
        }

        const perplexityData = await perplexityResponse.json();
        const searchResults = perplexityData.choices[0]?.message?.content || '';
        const citations = perplexityData.citations || [];

        // Step 2: Use Firecrawl to scrape detailed information from citations
        const scrapedDeals = [];
        
        for (const url of citations.slice(0, 5)) { // Limit to 5 URLs to avoid rate limits
            try {
                const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        url: url,
                        formats: ['markdown'],
                        onlyMainContent: true
                    })
                });

                if (scrapeResponse.ok) {
                    const scrapeData = await scrapeResponse.json();
                    scrapedDeals.push({
                        url: url,
                        content: scrapeData.markdown || scrapeData.data?.markdown || '',
                        metadata: scrapeData.metadata || {}
                    });
                }
            } catch (error) {
                console.error(`Error scraping ${url}:`, error);
            }
        }

        // Step 3: Use AI to extract structured deal data
        const extractionPrompt = `
Analyze the following scraped deal information and extract structured investment opportunities.
For each opportunity, provide:
- title: Clear deal title
- industry: Primary industry/sector
- summary: 2-3 sentence summary
- description: Detailed description
- estimated_value: Estimated deal value in USD (number)
- required_investment: Required investment amount (number)
- deal_structure: Type (equity, revenue share, debt, etc.)
- key_opportunities: Array of 3-5 key opportunities
- key_risks: Array of 3-5 key risks
- source_url: Original URL

Scraped Data:
${scrapedDeals.map(d => `URL: ${d.url}\n${d.content.substring(0, 2000)}`).join('\n\n---\n\n')}

Additional Context from AI Search:
${searchResults}

Return as JSON array of deal objects.`;

        const extractedDeals = await base44.integrations.Core.InvokeLLM({
            prompt: extractionPrompt,
            response_json_schema: {
                type: 'object',
                properties: {
                    deals: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                title: { type: 'string' },
                                industry: { type: 'string' },
                                summary: { type: 'string' },
                                description: { type: 'string' },
                                estimated_value: { type: 'number' },
                                required_investment: { type: 'number' },
                                deal_structure: { type: 'string' },
                                key_opportunities: { type: 'array', items: { type: 'string' } },
                                key_risks: { type: 'array', items: { type: 'string' } },
                                source_url: { type: 'string' }
                            }
                        }
                    }
                }
            }
        });

        // Step 4: Calculate match scores and perform initial categorization
        const dealsWithScores = [];
        
        for (const deal of (extractedDeals.deals || [])) {
            // Calculate match score based on user preferences
            let matchScore = 50; // Base score

            // Industry match
            if (userPrefs.target_industries?.some(ind => 
                deal.industry.toLowerCase().includes(ind.toLowerCase())
            )) {
                matchScore += 20;
            }

            // Investment size match
            if (deal.required_investment >= (userPrefs.investment_size_min || 0) &&
                deal.required_investment <= (userPrefs.investment_size_max || Infinity)) {
                matchScore += 15;
            }

            // Deal structure match
            if (userPrefs.preferred_deal_structures?.includes(deal.deal_structure)) {
                matchScore += 15;
            }

            // Initial risk assessment
            const riskScore = Math.min(10, Math.max(1, deal.key_risks?.length || 5));

            dealsWithScores.push({
                ...deal,
                match_score: Math.min(100, matchScore),
                risk_score: riskScore,
                source: 'api_sourced',
                status: 'pending',
                is_generated: false
            });
        }

        // Step 5: Create deals in database
        const createdDeals = [];
        for (const deal of dealsWithScores) {
            try {
                const created = await base44.asServiceRole.entities.SourcedDealOpportunity.create(deal);
                createdDeals.push(created);
            } catch (error) {
                console.error('Error creating deal:', error);
            }
        }

        return Response.json({
            success: true,
            deals_found: createdDeals.length,
            deals: createdDeals,
            sources_scraped: scrapedDeals.length
        });

    } catch (error) {
        console.error('Error scraping deals:', error);
        return Response.json({ 
            error: error.message,
            deals: []
        }, { status: 500 });
    }
});