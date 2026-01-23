import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deal_id } = await req.json();

    if (!deal_id) {
      return Response.json({ error: 'deal_id is required' }, { status: 400 });
    }

    const deal = await base44.entities.SourcedDealOpportunity.get(deal_id);

    // Step 1: Cross-reference with public records and regulatory filings
    const publicRecordsPrompt = `
You are a due diligence expert. Cross-reference this investment opportunity with public records and regulatory filings.

DEAL INFORMATION:
- Title: ${deal.title}
- Industry: ${deal.industry}
- Description: ${deal.description}
- Deal Structure: ${deal.deal_structure}
- Required Investment: $${deal.required_investment}

Search for and analyze:
1. Business registration and incorporation records
2. Regulatory filings (SEC, state, industry-specific)
3. Legal proceedings, lawsuits, or judgments
4. Patent and trademark registrations
5. Property records (if real estate)
6. Financial statements or disclosures
7. Media coverage and news articles
8. Better Business Bureau or consumer complaints

Provide detailed findings with specific references.
`;

    const publicRecordsAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: publicRecordsPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          business_registration: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              findings: { type: 'string' },
              verification_level: { type: 'string', enum: ['verified', 'partial', 'not_found'] }
            }
          },
          regulatory_filings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                date: { type: 'string' },
                summary: { type: 'string' },
                risk_level: { type: 'string' }
              }
            }
          },
          legal_proceedings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                case_type: { type: 'string' },
                status: { type: 'string' },
                description: { type: 'string' },
                impact: { type: 'string' }
              }
            }
          },
          intellectual_property: {
            type: 'object',
            properties: {
              patents: { type: 'number' },
              trademarks: { type: 'number' },
              summary: { type: 'string' }
            }
          },
          media_coverage: {
            type: 'object',
            properties: {
              sentiment: { type: 'string' },
              key_articles: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          },
          red_flags: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    // Step 2: Identify legal and compliance issues
    const compliancePrompt = `
Analyze potential legal and compliance issues for this ${deal.industry} investment.

DEAL DETAILS:
- Industry: ${deal.industry}
- Deal Structure: ${deal.deal_structure}
- Location/Jurisdiction: ${deal.geo_preferences || 'Not specified'}

Identify:
1. Industry-specific regulations (FDA, FCC, SEC, etc.)
2. Securities law compliance (Reg D, Reg A+, etc.)
3. Tax implications and compliance
4. Environmental regulations
5. Labor and employment laws
6. Data privacy (GDPR, CCPA)
7. International trade compliance (if applicable)
8. Licensing and permits required
9. Insurance requirements
10. Contractual obligations

Provide specific regulations, potential violations, and compliance recommendations.
`;

    const complianceAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: compliancePrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          regulatory_framework: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                regulation: { type: 'string' },
                governing_body: { type: 'string' },
                compliance_status: { type: 'string' },
                requirements: {
                  type: 'array',
                  items: { type: 'string' }
                },
                risk_level: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
              }
            }
          },
          securities_compliance: {
            type: 'object',
            properties: {
              applicable_exemptions: {
                type: 'array',
                items: { type: 'string' }
              },
              accreditation_required: { type: 'boolean' },
              disclosure_requirements: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          },
          licenses_permits: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                issuing_authority: { type: 'string' },
                status: { type: 'string' },
                notes: { type: 'string' }
              }
            }
          },
          compliance_gaps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                issue: { type: 'string' },
                severity: { type: 'string' },
                recommendation: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Step 3: Generate tailored due diligence checklist
    const checklistPrompt = `
Generate a comprehensive due diligence checklist for this ${deal.deal_structure} investment in the ${deal.industry} industry.

Organize the checklist into categories:
1. Corporate Structure & Governance
2. Financial Due Diligence
3. Legal & Compliance
4. Operational Due Diligence
5. Commercial Due Diligence
6. Technology & IP (if applicable)
7. Environmental, Social, Governance (ESG)
8. Tax Due Diligence

For each item, specify:
- Priority (critical, high, medium, low)
- Responsible party (investor, third-party, seller)
- Estimated timeline
- Documents required
`;

    const checklist = await base44.integrations.Core.InvokeLLM({
      prompt: checklistPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          categories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      task: { type: 'string' },
                      priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                      responsible_party: { type: 'string' },
                      estimated_timeline: { type: 'string' },
                      documents_required: {
                        type: 'array',
                        items: { type: 'string' }
                      },
                      status: { type: 'string', enum: ['pending', 'in_progress', 'completed'], default: 'pending' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Step 4: Summarize findings and flag critical information
    const executiveSummaryPrompt = `
Based on all the due diligence findings, create an executive summary.

PUBLIC RECORDS: ${JSON.stringify(publicRecordsAnalysis)}
COMPLIANCE: ${JSON.stringify(complianceAnalysis)}

Provide:
1. Overall risk rating (1-10)
2. Investment recommendation (proceed, proceed with caution, do not proceed, needs more investigation)
3. Critical findings that require immediate attention
4. Key strengths and opportunities
5. Deal-breakers or major concerns
6. Next steps and recommendations
7. Timeline for completing due diligence
`;

    const executiveSummary = await base44.integrations.Core.InvokeLLM({
      prompt: executiveSummaryPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_risk_rating: { type: 'number' },
          investment_recommendation: {
            type: 'string',
            enum: ['proceed', 'proceed_with_caution', 'do_not_proceed', 'needs_investigation']
          },
          critical_findings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                finding: { type: 'string' },
                severity: { type: 'string' },
                action_required: { type: 'string' }
              }
            }
          },
          key_strengths: {
            type: 'array',
            items: { type: 'string' }
          },
          major_concerns: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                concern: { type: 'string' },
                impact: { type: 'string' },
                mitigation: { type: 'string' }
              }
            }
          },
          next_steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                step: { type: 'string' },
                priority: { type: 'string' },
                timeline: { type: 'string' }
              }
            }
          },
          estimated_dd_completion: { type: 'string' }
        }
      }
    });

    // Compile comprehensive report
    const dueDiligenceReport = {
      deal_id: deal.id,
      deal_title: deal.title,
      public_records: publicRecordsAnalysis,
      compliance_analysis: complianceAnalysis,
      due_diligence_checklist: checklist,
      executive_summary: executiveSummary,
      generated_at: new Date().toISOString(),
      status: 'completed'
    };

    // Update deal with due diligence data
    await base44.entities.SourcedDealOpportunity.update(deal_id, {
      due_diligence_report: dueDiligenceReport,
      due_diligence_completed_at: new Date().toISOString(),
      dd_risk_rating: executiveSummary.overall_risk_rating,
      dd_recommendation: executiveSummary.investment_recommendation
    });

    return Response.json({
      success: true,
      report: dueDiligenceReport
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});