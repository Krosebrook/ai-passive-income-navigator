import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { industry, timeframe = 12 } = await req.json();
    
    if (!industry) {
      return Response.json({ error: 'Industry parameter required' }, { status: 400 });
    }

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      return Response.json({ error: 'PERPLEXITY_API_KEY not configured' }, { status: 500 });
    }

    const forecastQuery = `As a financial analyst, forecast demand for the ${industry} industry over the next ${timeframe} months.
    
    Analyze:
    1. Current market size and growth trajectory
    2. Macroeconomic factors (interest rates, inflation, GDP)
    3. Technology disruptions and innovation cycles
    4. Regulatory changes and policy impacts
    5. Consumer behavior shifts
    6. Competitive landscape evolution
    
    Provide:
    - Demand forecast (percentage change over timeframe)
    - Growth drivers (top 3)
    - Risk factors (top 3)
    - Investment timing recommendation (now, 3 months, 6 months, wait)
    - Confidence level (0-100%)
    - Key milestones to watch
    - Scenario analysis (best case, base case, worst case)
    
    Return as JSON.`;

    const forecastResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [{
          role: 'user',
          content: forecastQuery
        }],
        temperature: 0.2,
        max_tokens: 3000
      })
    });

    if (!forecastResponse.ok) {
      throw new Error(`Perplexity API error: ${forecastResponse.statusText}`);
    }

    const forecastData = await forecastResponse.json();
    const content = forecastData.choices[0].message.content;
    
    // Parse JSON from response
    let forecast = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        forecast = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse forecast JSON:', parseError);
      forecast = {
        raw_analysis: content,
        industry,
        timeframe,
        note: 'Structured parsing failed, returning raw analysis'
      };
    }

    // Store prediction for historical tracking
    await base44.entities.FinancialPrediction.create({
      user_email: user.email,
      prediction_type: 'industry_demand',
      target_industry: industry,
      timeframe_months: timeframe,
      prediction_data: forecast,
      confidence_score: forecast.confidence_level || 70,
      created_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      industry,
      timeframe,
      forecast,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Demand forecasting error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to forecast industry demand'
    }, { status: 500 });
  }
});