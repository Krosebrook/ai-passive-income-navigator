import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  TrendingUp, AlertTriangle, Target, DollarSign, 
  Users, Clock, Lightbulb, CheckCircle, XCircle, Loader2,
  Upload, FileText, Cloud, BarChart3
} from 'lucide-react';

/**
 * AI Deal Analyzer
 * Evaluates passive income opportunities with comprehensive risk/reward analysis
 */
export default function DealAnalyzer() {
  const [step, setStep] = useState('input'); // input | analyzing | results
  const [dealData, setDealData] = useState({
    dealName: '',
    dealDescription: '',
    dealCategory: ''
  });
  const [criteria, setCriteria] = useState({
    min_market_size: 100000,
    max_competition_level: 'medium',
    max_profitability_timeline_months: 12,
    min_profit_margin: 20,
    required_initial_investment: 5000,
    risk_tolerance: 'medium'
  });
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [runScenarios, setRunScenarios] = useState(true);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }
      setUploadedFiles([...uploadedFiles, ...uploadedUrls]);
      toast.success(`${files.length} document(s) uploaded`);
    } catch (error) {
      toast.error('Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!dealData.dealName || !dealData.dealDescription) {
      toast.error('Please provide deal name and description');
      return;
    }

    setIsAnalyzing(true);
    setStep('analyzing');

    try {
      const response = await base44.functions.invoke('analyzeDeal', {
        dealName: dealData.dealName,
        dealDescription: dealData.dealDescription,
        dealCategory: dealData.dealCategory,
        userCriteria: criteria,
        documentUrls: uploadedFiles,
        runScenarios
      });

      setAnalysis(response.data);
      setStep('results');
      toast.success('Enhanced analysis complete with real-time data!');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze deal');
      setStep('input');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'strong_buy': return 'bg-green-600';
      case 'buy': return 'bg-emerald-500';
      case 'hold': return 'bg-yellow-500';
      case 'avoid': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Input Form */}
      {step === 'input' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Deal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Deal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Deal Name *</Label>
                <Input
                  value={dealData.dealName}
                  onChange={(e) => setDealData({ ...dealData, dealName: e.target.value })}
                  placeholder="e.g., Fitness Niche Blog"
                />
              </div>

              <div>
                <Label>Category</Label>
                <Input
                  value={dealData.dealCategory}
                  onChange={(e) => setDealData({ ...dealData, dealCategory: e.target.value })}
                  placeholder="e.g., Content Creation, E-commerce"
                />
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  value={dealData.dealDescription}
                  onChange={(e) => setDealData({ ...dealData, dealDescription: e.target.value })}
                  placeholder="Describe the opportunity, business model, target audience, etc."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* User Criteria */}
          <Card>
            <CardHeader>
              <CardTitle>Your Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Minimum Market Size ($)</Label>
                <Input
                  type="number"
                  value={criteria.min_market_size}
                  onChange={(e) => setCriteria({ ...criteria, min_market_size: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label>Max Competition Level</Label>
                <Select
                  value={criteria.max_competition_level}
                  onValueChange={(value) => setCriteria({ ...criteria, max_competition_level: value })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Competition</SelectItem>
                    <SelectItem value="medium">Medium Competition</SelectItem>
                    <SelectItem value="high">High Competition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Max Timeline to Profit (months)</Label>
                <Input
                  type="number"
                  value={criteria.max_profitability_timeline_months}
                  onChange={(e) => setCriteria({ ...criteria, max_profitability_timeline_months: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label>Min Profit Margin (%)</Label>
                <Input
                  type="number"
                  value={criteria.min_profit_margin}
                  onChange={(e) => setCriteria({ ...criteria, min_profit_margin: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label>Available Investment ($)</Label>
                <Input
                  type="number"
                  value={criteria.required_initial_investment}
                  onChange={(e) => setCriteria({ ...criteria, required_initial_investment: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label>Risk Tolerance</Label>
                <Select
                  value={criteria.risk_tolerance}
                  onValueChange={(value) => setCriteria({ ...criteria, risk_tolerance: value })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Document Upload & Analysis Options */}
          <Card className="md:col-span-2 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-600" />
                Enhanced Analysis Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4" />
                  Upload Supporting Documents (Business Plans, Financial Statements, etc.)
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  {isUploading && <Loader2 className="w-5 h-5 animate-spin" />}
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {uploadedFiles.map((url, idx) => (
                      <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Document {idx + 1}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="scenarios"
                  checked={runScenarios}
                  onChange={(e) => setRunScenarios(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="scenarios" className="flex items-center gap-2 cursor-pointer">
                  <BarChart3 className="w-4 h-4 text-violet-600" />
                  Run Economic Scenario Simulations (Optimistic, Base, Pessimistic)
                </Label>
              </div>

              <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
                ✨ <strong>Enhanced with Real-Time Data:</strong> Market trends, competitor analysis, 
                keyword search volumes, and current economic indicators
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Button onClick={handleAnalyze} className="w-full" size="lg">
              <TrendingUp className="w-5 h-5 mr-2" />
              Run Enhanced Analysis with Real-Time Data
            </Button>
          </div>
        </div>
      )}

      {/* Analyzing State */}
      {step === 'analyzing' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-16 h-16 text-violet-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Running Enhanced Analysis...</h3>
            <div className="text-center space-y-2 text-sm text-gray-600">
              <p>✓ Fetching real-time market data...</p>
              <p>✓ Analyzing competition and trends...</p>
              {uploadedFiles.length > 0 && <p>✓ Processing uploaded documents...</p>}
              {runScenarios && <p>✓ Simulating economic scenarios...</p>}
              <p className="text-xs text-gray-500 mt-4">This may take 30-60 seconds</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {step === 'results' && analysis?.analysis_results && (
        <div className="space-y-6">
          {/* Overall Scores */}
          <Card className="bg-gradient-to-r from-violet-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{dealData.dealName}</h2>
                  <p className="text-gray-600">{dealData.dealCategory}</p>
                </div>
                <Badge className={`${getRecommendationColor(analysis.analysis_results.recommendation)} text-white text-lg px-4 py-2`}>
                  {analysis.analysis_results.recommendation.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-violet-600" />
                    <p className="text-sm text-gray-600">Overall Score</p>
                  </div>
                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    {analysis.analysis_results.overall_score}
                  </p>
                  <Progress value={analysis.analysis_results.overall_score} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-gray-600">Risk Score</p>
                  </div>
                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    {analysis.analysis_results.risk_score}
                  </p>
                  <Progress value={analysis.analysis_results.risk_score} className="h-2 bg-red-100" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <p className="text-sm text-gray-600">Reward Score</p>
                  </div>
                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    {analysis.analysis_results.reward_score}
                  </p>
                  <Progress value={analysis.analysis_results.reward_score} className="h-2 bg-emerald-100" />
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg border border-violet-200">
                <p className="text-sm text-gray-700">
                  <strong>Recommendation:</strong> {analysis.analysis_results.recommendation_reasoning}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Criteria Match */}
          {analysis.criteria_match && (
            <Card>
              <CardHeader>
                <CardTitle>Criteria Match</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(analysis.criteria_match).filter(([key]) => key !== 'overall_match_percentage').map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      {value ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="text-sm">{key.replace(/_/g, ' ').replace(/match/g, '').trim()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Overall Match</p>
                  <Progress value={analysis.criteria_match.overall_match_percentage} className="h-3" />
                  <p className="text-right text-sm font-semibold mt-1">
                    {analysis.criteria_match.overall_match_percentage}%
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Analysis */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Market Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Market Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600">Market Size</p>
                  <p className="font-semibold">{analysis.analysis_results.market_analysis.market_size_estimate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Growth Rate</p>
                  <p className="font-semibold">{analysis.analysis_results.market_analysis.growth_rate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Saturation</p>
                  <p className="text-sm">{analysis.analysis_results.market_analysis.saturation_level}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Score</p>
                  <Progress value={analysis.analysis_results.market_analysis.score} />
                  <p className="text-right text-sm font-semibold mt-1">
                    {analysis.analysis_results.market_analysis.score}/100
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Competition Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  Competition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600">Level</p>
                  <Badge>{analysis.analysis_results.competition_analysis.competition_level}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Key Competitors</p>
                  <ul className="text-sm space-y-1">
                    {analysis.analysis_results.competition_analysis.key_competitors?.slice(0, 3).map((comp, idx) => (
                      <li key={idx}>• {comp}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Score</p>
                  <Progress value={analysis.analysis_results.competition_analysis.score} />
                  <p className="text-right text-sm font-semibold mt-1">
                    {analysis.analysis_results.competition_analysis.score}/100
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Profitability Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Profitability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600">Timeline</p>
                  <p className="font-semibold">{analysis.analysis_results.profitability_analysis.estimated_timeline_months} months</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Profit Margin</p>
                  <p className="font-semibold">{analysis.analysis_results.profitability_analysis.expected_profit_margin}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Revenue Potential</p>
                  <p className="text-sm">{analysis.analysis_results.profitability_analysis.revenue_potential}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Score</p>
                  <Progress value={analysis.analysis_results.profitability_analysis.score} />
                  <p className="text-right text-sm font-semibold mt-1">
                    {analysis.analysis_results.profitability_analysis.score}/100
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Factors */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Risk Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.analysis_results.risk_factors?.map((risk, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border ${getSeverityColor(risk.severity)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold">{risk.factor}</p>
                      <Badge className={getSeverityColor(risk.severity)}>
                        {risk.severity}
                      </Badge>
                    </div>
                    <p className="text-sm">
                      <strong>Mitigation:</strong> {risk.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Opportunities */}
          <Card className="border-emerald-200 bg-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-emerald-600" />
                Key Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.analysis_results.opportunities?.map((opp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Economic Scenarios */}
          {analysis?.analysis_results?.scenarios && (
            <Card className="border-violet-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-violet-600" />
                  Economic Scenario Simulations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="0">
                  <TabsList className="grid w-full grid-cols-3">
                    {analysis.analysis_results.scenarios.map((scenario, idx) => (
                      <TabsTrigger key={idx} value={idx.toString()}>
                        {scenario.scenario_name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {analysis.analysis_results.scenarios.map((scenario, idx) => (
                    <TabsContent key={idx} value={idx.toString()} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Revenue Impact</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {scenario.revenue_impact_pct > 0 ? '+' : ''}{scenario.revenue_impact_pct}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Profit Margin Impact</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {scenario.profit_margin_impact > 0 ? '+' : ''}{scenario.profit_margin_impact}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Timeline Adjustment</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {scenario.timeline_adjustment_months > 0 ? '+' : ''}{scenario.timeline_adjustment_months} months
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Risk Level</p>
                          <Badge className={scenario.risk_level === 'high' ? 'bg-red-500' : scenario.risk_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}>
                            {scenario.risk_level}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-2">Key Triggers</p>
                        <ul className="space-y-1">
                          {scenario.key_triggers?.map((trigger, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                              {trigger}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-2">Recommended Actions</p>
                        <ul className="space-y-1">
                          {scenario.recommended_actions?.map((action, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Data Source Badge */}
          {analysis?.analysis_results?.market_data_timestamp && (
            <div className="text-center text-sm text-gray-500">
              <Badge variant="outline" className="gap-2">
                <Cloud className="w-3 h-3" />
                Real-time data as of {new Date(analysis.analysis_results.market_data_timestamp).toLocaleString()}
              </Badge>
              {analysis.analysis_results.document_analysis_included && (
                <Badge variant="outline" className="gap-2 ml-2">
                  <FileText className="w-3 h-3" />
                  {uploadedFiles.length} document(s) analyzed
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={() => setStep('input')} variant="outline" className="flex-1">
              Analyze Another Deal
            </Button>
            <Button className="flex-1">
              Add to Portfolio
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}