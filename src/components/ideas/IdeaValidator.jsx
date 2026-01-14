import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Loader2, CheckCircle2, AlertCircle, TrendingUp, Target,
  AlertTriangle, Lightbulb
} from 'lucide-react';

/**
 * Idea Validator Component
 * 
 * AI-powered validation for passive income ideas
 * Assesses:
 * - Market viability
 * - Competition analysis
 * - Monetization potential
 * - Execution risks
 * - Financial viability
 */
export default function IdeaValidator({ open, onClose, onAddToPortfolio }) {
  const [step, setStep] = useState('input'); // input, loading, results
  const [validation, setValidation] = useState(null);
  const [formData, setFormData] = useState({
    ideaTitle: '',
    ideaDescription: '',
    targetMarket: '',
    initialInvestment: '$500'
  });
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async () => {
    if (!formData.ideaTitle || !formData.ideaDescription || !formData.targetMarket) {
      alert('Please fill in all required fields');
      return;
    }

    setIsValidating(true);
    setStep('loading');

    const response = await base44.functions.invoke('validatePassiveIncomeIdea', {
      ideaTitle: formData.ideaTitle,
      ideaDescription: formData.ideaDescription,
      targetMarket: formData.targetMarket,
      initialInvestment: formData.initialInvestment
    });

    setValidation(response.data);
    setStep('results');
    setIsValidating(false);
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 75) return 'bg-emerald-100';
    if (score >= 50) return 'bg-amber-100';
    return 'bg-red-100';
  };

  const handleAddToPortfolio = () => {
    onAddToPortfolio({
      title: formData.ideaTitle,
      description: formData.ideaDescription,
      notes: `Validation Score: ${validation.overall_validation_score}%\nRecommendation: ${validation.go_no_go_recommendation}`
    });
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      ideaTitle: '',
      ideaDescription: '',
      targetMarket: '',
      initialInvestment: '$500'
    });
    setValidation(null);
    setStep('input');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-600" />
            Idea Validator
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Input Step */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium mb-1 block">Idea Title *</label>
                <Input
                  value={formData.ideaTitle}
                  onChange={(e) => setFormData({ ...formData, ideaTitle: e.target.value })}
                  placeholder="e.g., AI-Powered Content Calendar Generator"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description *</label>
                <Textarea
                  value={formData.ideaDescription}
                  onChange={(e) => setFormData({ ...formData, ideaDescription: e.target.value })}
                  placeholder="Describe your idea in detail..."
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Target Market *</label>
                <Input
                  value={formData.targetMarket}
                  onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                  placeholder="e.g., small business owners, content creators"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Initial Investment</label>
                <Input
                  value={formData.initialInvestment}
                  onChange={(e) => setFormData({ ...formData, initialInvestment: e.target.value })}
                  placeholder="e.g., $500"
                />
              </div>

              <Button
                onClick={handleValidate}
                disabled={isValidating || !formData.ideaTitle || !formData.ideaDescription}
                className="w-full gap-2 bg-violet-600 hover:bg-violet-700"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Validate Idea
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Loading Step */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Analyzing your idea...</p>
              <p className="text-sm text-gray-400 mt-2">Evaluating market viability, competition, and monetization potential</p>
            </motion.div>
          )}

          {/* Results Step */}
          {step === 'results' && validation && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Overall Score */}
              <Card className={`border-2 ${getScoreBg(validation.overall_validation_score)}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Overall Validation Score</p>
                      <p className={`text-4xl font-bold ${getScoreColor(validation.overall_validation_score)}`}>
                        {validation.overall_validation_score}%
                      </p>
                    </div>
                    <Badge className={getScoreBg(validation.overall_validation_score)}>
                      {validation.go_no_go_recommendation}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{validation.validation_summary}</p>
                </CardContent>
              </Card>

              {/* Viability Scores */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Dimension Scores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(validation.viability_scores).map(([key, score]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <p className="text-xs font-medium text-gray-700 capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Market Analysis */}
              {validation.market_analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Market Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Market Size: <span className="font-medium">{validation.market_analysis.market_size}</span></p>
                    </div>
                    <div>
                      <p className="text-gray-600">Growth Potential: <span className="font-medium">{validation.market_analysis.growth_potential}</span></p>
                    </div>
                    <div>
                      <p className="text-gray-600">Saturation: <span className="font-medium capitalize">{validation.market_analysis.saturation_level}</span></p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Risk Assessment */}
              {validation.risk_assessment && validation.risk_assessment.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {validation.risk_assessment.slice(0, 3).map((risk, idx) => (
                      <div key={idx} className="text-xs">
                        <p className="font-medium text-red-900">{risk.risk}</p>
                        <p className="text-red-700">
                          Severity: <span className="font-medium capitalize">{risk.severity}</span> | 
                          Likelihood: <span className="font-medium capitalize">{risk.likelihood}</span>
                        </p>
                        <p className="text-red-700 mt-1">Mitigation: {risk.mitigation}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Success Factors */}
              {validation.success_factors && (
                <Card className="border-emerald-200 bg-emerald-50">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Success Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {validation.success_factors.map((factor, idx) => (
                        <li key={idx} className="text-xs text-emerald-700 flex gap-2">
                          <span>✓</span> {factor}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Improvement Suggestions */}
              {validation.improvement_suggestions && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                      <Lightbulb className="w-4 h-4" />
                      Improvement Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {validation.improvement_suggestions.map((suggestion, idx) => (
                        <li key={idx} className="text-xs text-amber-700 flex gap-2">
                          <span>→</span> {suggestion}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="flex-1"
                >
                  Validate Another Idea
                </Button>
                <Button
                  onClick={handleAddToPortfolio}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  Add to Portfolio
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}