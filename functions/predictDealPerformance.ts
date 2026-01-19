import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { deal } = await req.json();

        if (!deal) {
            return Response.json({ error: 'Deal data is required' }, { status: 400 });
        }

        // Craft a comprehensive prompt for predictive analytics
        const prompt = `You are a financial analyst AI specializing in investment opportunity assessment. 

Analyze the following deal opportunity and provide detailed predictions:

Deal Title: ${deal.title}
Industry: ${deal.industry}
Summary: ${deal.summary}
Estimated Value: $${deal.estimated_value || 'N/A'}
Current Estimated ROI: ${deal.estimated_roi || 'N/A'}%
Risk Score: ${deal.risk_score || 'N/A'}/10
Time to ROI: ${deal.time_to_roi || 'N/A'}

Based on current market conditions, industry trends, and the deal parameters, provide:

1. A refined predicted ROI percentage (considering current market dynamics)
2. A predicted risk score (1-10, factoring in market volatility and industry-specific risks)
3. A predicted time to profit (in months)
4. A confidence level for these predictions (0-100%)
5. Key factors influencing these predictions

Consider:
- Current economic conditions
- Industry-specific trends and challenges
- Market volatility and competitive landscape
- Historical performance of similar deals
- Regulatory and geopolitical factors`;

        // Call LLM with internet context for real-time market data
        const result = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    predicted_roi: {
                        type: "number",
                        description: "Predicted ROI percentage"
                    },
                    predicted_risk_score: {
                        type: "number",
                        description: "Predicted risk score (1-10)"
                    },
                    predicted_time_to_profit: {
                        type: "number",
                        description: "Predicted time to profit in months"
                    },
                    confidence_level: {
                        type: "number",
                        description: "Confidence level (0-100%)"
                    },
                    key_factors: {
                        type: "array",
                        items: { type: "string" },
                        description: "Key factors influencing predictions"
                    },
                    market_outlook: {
                        type: "string",
                        description: "Brief market outlook for this deal"
                    }
                },
                required: ["predicted_roi", "predicted_risk_score", "predicted_time_to_profit", "confidence_level"]
            }
        });

        return Response.json({
            success: true,
            predictions: result,
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error predicting deal performance:', error);
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});