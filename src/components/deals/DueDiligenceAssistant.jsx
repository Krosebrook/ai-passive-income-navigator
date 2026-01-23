import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileSearch, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Shield,
  FileText,
  Scale,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DueDiligenceAssistant({ deal, onComplete }) {
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(deal?.due_diligence_report || null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await base44.functions.invoke('generateDueDiligenceReport', {
        deal_id: deal.id
      });
      setReport(data.report);
      toast.success('Due diligence report generated');
      if (onComplete) onComplete(data.report);
    } catch (error) {
      toast.error('Failed to generate report');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const getRiskColor = (rating) => {
    if (rating <= 3) return 'text-green-500';
    if (rating <= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRecommendationBadge = (recommendation) => {
    const config = {
      proceed: { label: 'Proceed', className: 'bg-green-500/20 text-green-500 border-green-500/50' },
      proceed_with_caution: { label: 'Proceed with Caution', className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' },
      do_not_proceed: { label: 'Do Not Proceed', className: 'bg-red-500/20 text-red-500 border-red-500/50' },
      needs_investigation: { label: 'Needs Investigation', className: 'bg-orange-500/20 text-orange-500 border-orange-500/50' }
    };
    return config[recommendation] || config.needs_investigation;
  };

  if (generating) {
    return (
      <Card className="card-dark">
        <CardContent className="p-12">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Generating Due Diligence Report</h3>
              <p className="text-gray-400 text-sm">
                Analyzing public records, regulatory filings, and compliance requirements...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card className="card-dark">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] flex items-center justify-center mx-auto mb-4">
              <FileSearch className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Due Diligence Assistant</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Generate a comprehensive due diligence report including public records verification, compliance analysis, and a tailored checklist.
            </p>
            <Button onClick={handleGenerate} className="btn-primary">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Due Diligence Report
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { executive_summary, public_records, compliance_analysis, due_diligence_checklist } = report;
  const checklistProgress = due_diligence_checklist?.categories?.reduce((acc, cat) => {
    const completed = cat.items.filter(i => i.status === 'completed').length;
    const total = cat.items.length;
    return { completed: acc.completed + completed, total: acc.total + total };
  }, { completed: 0, total: 0 }) || { completed: 0, total: 0 };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="card-dark border-[#8b85f7]/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] bg-clip-text text-transparent">
            <Shield className="w-5 h-5 text-[#8b85f7]" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Overall Risk Rating</p>
              <p className={`text-3xl font-bold ${getRiskColor(executive_summary.overall_risk_rating)}`}>
                {executive_summary.overall_risk_rating}/10
              </p>
            </div>
            <Badge className={`${getRecommendationBadge(executive_summary.investment_recommendation).className} border`}>
              {getRecommendationBadge(executive_summary.investment_recommendation).label}
            </Badge>
          </div>

          {executive_summary.critical_findings?.length > 0 && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h4 className="font-semibold text-red-500">Critical Findings</h4>
              </div>
              <div className="space-y-2">
                {executive_summary.critical_findings.map((finding, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="text-white font-medium">{finding.finding}</p>
                    <p className="text-gray-400 text-xs mt-1">Action: {finding.action_required}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {executive_summary.major_concerns?.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-yellow-500" />
                Major Concerns
              </h4>
              <div className="space-y-2">
                {executive_summary.major_concerns.map((concern, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                    <p className="text-white text-sm font-medium">{concern.concern}</p>
                    <p className="text-gray-400 text-xs mt-1">Impact: {concern.impact}</p>
                    <p className="text-[#00b7eb] text-xs mt-1">Mitigation: {concern.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {executive_summary.key_strengths?.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Key Strengths
              </h4>
              <ul className="space-y-1">
                {executive_summary.key_strengths.map((strength, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="records" className="space-y-4">
        <TabsList className="bg-[#1a0f2e] border border-[#2d1e50]">
          <TabsTrigger value="records">Public Records</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="checklist">DD Checklist</TabsTrigger>
          <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
        </TabsList>

        <TabsContent value="records">
          <Card className="card-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gradient">
                <FileText className="w-5 h-5 text-[#8b85f7]" />
                Public Records Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Business Registration */}
              <div>
                <h4 className="font-semibold text-white mb-2">Business Registration</h4>
                <div className="p-3 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={
                      public_records.business_registration?.verification_level === 'verified' ? 'badge-success' :
                      public_records.business_registration?.verification_level === 'partial' ? 'badge-warning' : 'badge-error'
                    }>
                      {public_records.business_registration?.verification_level || 'Unknown'}
                    </Badge>
                    <p className="text-sm text-gray-400">{public_records.business_registration?.status}</p>
                  </div>
                  <p className="text-sm text-gray-300">{public_records.business_registration?.findings}</p>
                </div>
              </div>

              {/* Legal Proceedings */}
              {public_records.legal_proceedings?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-2">Legal Proceedings</h4>
                  <div className="space-y-2">
                    {public_records.legal_proceedings.map((proceeding, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-white">{proceeding.case_type}</p>
                          <Badge variant="outline">{proceeding.status}</Badge>
                        </div>
                        <p className="text-xs text-gray-400">{proceeding.description}</p>
                        <p className="text-xs text-[#ff8e42] mt-1">Impact: {proceeding.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Red Flags */}
              {public_records.red_flags?.length > 0 && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <h4 className="font-semibold text-red-500 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Red Flags
                  </h4>
                  <ul className="space-y-1">
                    {public_records.red_flags.map((flag, idx) => (
                      <li key={idx} className="text-sm text-red-400">• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card className="card-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gradient">
                <Scale className="w-5 h-5 text-[#8b85f7]" />
                Compliance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Regulatory Framework */}
              {compliance_analysis.regulatory_framework?.map((regulation, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-white">{regulation.regulation}</h4>
                      <p className="text-xs text-gray-400">{regulation.governing_body}</p>
                    </div>
                    <Badge className={
                      regulation.risk_level === 'critical' ? 'bg-red-500/20 text-red-500' :
                      regulation.risk_level === 'high' ? 'bg-orange-500/20 text-orange-500' :
                      regulation.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-500' : 'badge-success'
                    }>
                      {regulation.risk_level}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{regulation.compliance_status}</p>
                  {regulation.requirements?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-400 mb-1">Requirements:</p>
                      <ul className="space-y-1">
                        {regulation.requirements.map((req, ridx) => (
                          <li key={ridx} className="text-xs text-gray-300">• {req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}

              {/* Compliance Gaps */}
              {compliance_analysis.compliance_gaps?.length > 0 && (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <h4 className="font-semibold text-yellow-500 mb-3">Compliance Gaps</h4>
                  <div className="space-y-2">
                    {compliance_analysis.compliance_gaps.map((gap, idx) => (
                      <div key={idx}>
                        <p className="text-sm text-white font-medium">{gap.issue}</p>
                        <p className="text-xs text-gray-400 mt-1">Recommendation: {gap.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist">
          <Card className="card-dark">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gradient">
                  <CheckCircle2 className="w-5 h-5 text-[#8b85f7]" />
                  Due Diligence Checklist
                </CardTitle>
                <div className="text-sm text-gray-400">
                  {checklistProgress.completed} / {checklistProgress.total} completed
                </div>
              </div>
              <Progress value={(checklistProgress.completed / checklistProgress.total) * 100} className="mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              {due_diligence_checklist.categories?.map((category, cidx) => (
                <div key={cidx}>
                  <h4 className="font-semibold text-white mb-3">{category.category}</h4>
                  <div className="space-y-2">
                    {category.items.map((item, iidx) => (
                      <div key={iidx} className="p-3 rounded-lg bg-[#0f0618] border border-[#2d1e50] flex items-start gap-3">
                        <Checkbox className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <p className="text-sm text-white font-medium">{item.task}</p>
                            <Badge className={
                              item.priority === 'critical' ? 'bg-red-500/20 text-red-500 text-xs' :
                              item.priority === 'high' ? 'bg-orange-500/20 text-orange-500 text-xs' :
                              item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500 text-xs' : 'badge-primary text-xs'
                            }>
                              {item.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                            <span>📋 {item.responsible_party}</span>
                            <span>⏱️ {item.estimated_timeline}</span>
                          </div>
                          {item.documents_required?.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Docs: {item.documents_required.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="next-steps">
          <Card className="card-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gradient">
                <TrendingUp className="w-5 h-5 text-[#8b85f7]" />
                Recommended Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {executive_summary.next_steps?.map((step, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium mb-1">{step.step}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge className={
                          step.priority === 'high' ? 'bg-red-500/20 text-red-500 border-red-500/50' :
                          step.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' : 'badge-primary'
                        }>
                          {step.priority}
                        </Badge>
                        <span className="text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {step.timeline}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-4 rounded-lg bg-[#8b85f7]/10 border border-[#8b85f7]/30 mt-4">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-white">Estimated DD Completion:</span>{' '}
                  {executive_summary.estimated_dd_completion}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}