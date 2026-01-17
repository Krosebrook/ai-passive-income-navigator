import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AI-powered financial analysis for deals and portfolio items
 * Provides risk assessment, ROI projection, and due diligence checks
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entityType, entityId } = await req.json();

    if (!entityType || !entityId) {
      return Response.json({ error: 'Missing entityType or entityId' }, { status: 400 });
    }

    let entityData;
    if (entityType === 'SourcedDealOpportunity') {
      const deals = await base44.entities.SourcedDealOpportunity.filter({ id: entityId });
      entityData = deals[0];
    } else if (entityType === 'PortfolioIdea') {
      const ideas = await base44.entities.PortfolioIdea.filter({ id: entityId });
      entityData = ideas[0];
    } else {
      return Response.json({ error: 'Invalid entity type' }, { status: 400 });
    }

    if (!entityData) {
      return Response.json({ error: 'Entity not found' }, { status: 404 });
    }

    const prompt = `You are an AI financial analyst specializing in passive income investments. Conduct a comprehensive financial analysis of this ${entityType === 'SourcedDealOpportunity' ? 'deal opportunity' : 'portfolio idea'}.

INVESTMENT DETAILS:
${JSON.stringify(entityData, null, 2)}

Provide a detailed analysis including:

1. RISK ASSESSMENT (0-100 score, higher = riskier)
   - Overall risk score
   - Key risk factors (array of strings)
   - Risk mitigation strategies

2. ROI PROJECTION
   - Projected 12-month ROI percentage
   - Projected 24-month ROI percentage
   - Best case annual return
   - Worst case annual return
   - Most likely annual return
   - Key assumptions made

3. DUE DILIGENCE CHECKLIST
   - Items to verify before investing (array of strings)
   - Red flags to watch for (array of strings)
   - Questions to ask the seller/platform

4. FINANCIAL VIABILITY
   - Break-even timeline (months)
   - Cash flow assessment
   - Scalability potential (low/medium/high)
   - Exit strategy options

5. RECOMMENDATION
   - Overall recommendation (strong_buy/buy/hold/avoid)
   - Confidence level (low/medium/high)
   - Reasoning

Use internet context to research the industry, market trends, and comparable deals.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          risk_assessment: {
            type: 'object',
            properties: {
              risk_score: { type: 'number' },
              key_risk_factors: { type: 'array', items: { type: 'string' } },
              mitigation_strategies: { type: 'array', items: { type: 'string' } }
            }
          },
          roi_projection: {
            type: 'object',
            properties: {
              projected_12mo_roi: { type: 'number' },
              projected_24mo_roi: { type: 'number' },
              best_case_return: { type: 'number' },
              worst_case_return: { type: 'number' },
              most_likely_return: { type: 'number' },
              key_assumptions: { type: 'array', items: { type: 'string' } }
            }
          },
          due_diligence: {
            type: 'object',
            properties: {
              verification_items: { type: 'array', items: { type: 'string' } },
              red_flags: { type: 'array', items: { type: 'string' } },
              questions_to_ask: { type: 'array', items: { type: 'string' } }
            }
          },
          financial_viability: {
            type: 'object',
            properties: {
              breakeven_months: { type: 'number' },
              cash_flow_assessment: { type: 'string' },
              scalability: { type: 'string' },
              exit_strategies: { type: 'array', items: { type: 'string' } }
            }
          },
          recommendation: {
            type: 'object',
            properties: {
              overall: { type: 'string' },
              confidence: { type: 'string' },
              reasoning: { type: 'string' }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      analysis: response,
      analyzed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Financial analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});