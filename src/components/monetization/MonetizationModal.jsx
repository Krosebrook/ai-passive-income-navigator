import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  DollarSign, Users, Scale, Megaphone, Target, 
  Loader2, Copy, CheckCircle, TrendingUp
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const ANALYSIS_TABS = [
  { id: 'pricing', label: 'Pricing Strategy', icon: DollarSign },
  { id: 'competitors', label: 'Competitors', icon: Users },
  { id: 'legal', label: 'Legal', icon: Scale },
  { id: 'marketing', label: 'Marketing Copy', icon: Megaphone },
  { id: 'validation', label: 'Validation', icon: Target }
];

export default function MonetizationModal({ idea, open, onClose, existingAnalysis }) {
  const [activeTab, setActiveTab] = useState('pricing');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(existingAnalysis || {});
  const [copied, setCopied] = useState(false);

  const generateAnalysis = async (type) => {
    setIsLoading(true);
    
    const prompts = {
      pricing: `Analyze pricing strategy for this business idea: "${idea.title}". Description: ${idea.description}. Include: recommended pricing tiers, competitive pricing analysis, psychological pricing tactics, and revenue projections.`,
      competitors: `Perform competitor analysis for: "${idea.title}". Include: top 5 competitors, market gaps, differentiation strategies, SWOT analysis.`,
      legal: `Provide legal compliance requirements for: "${idea.title}". Include: recommended business structure, required licenses, tax obligations, data privacy requirements, IP considerations.`,
      marketing: `Create marketing copy for: "${idea.title}". Include: landing page headlines and copy, 3 email campaign templates, 10 social media posts, 5 ad copy variations.`,
      validation: `Validate this business idea: "${idea.title}". Include: market size (TAM, SAM, SOM), target audience profile, competition analysis, monetization potential score (1-10), risk factors, recommended next steps.`
    };

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompts[type],
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          analysis: { type: 'object' },
          summary: { type: 'string' },
          recommendations: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    setAnalysis(prev => ({ ...prev, [type]: response }));
    
    // Save to database
    await base44.entities.MonetizationAnalysis.create({
      portfolio_idea_id: idea.id,
      idea_title: idea.title,
      analysis_type: type,
      [`${type === 'marketing' ? 'marketing_campaigns' : type}_analysis`]: response,
      is_active: true
    });

    setIsLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(typeof text === 'object' ? JSON.stringify(text, null, 2) : text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    const currentAnalysis = analysis[activeTab];

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
          <p className="text-gray-500">Generating {activeTab} analysis...</p>
          <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
        </div>
      );
    }

    if (!currentAnalysis) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mb-4">
            {React.createElement(ANALYSIS_TABS.find(t => t.id === activeTab)?.icon || DollarSign, {
              className: 'w-8 h-8 text-violet-600'
            })}
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Generate {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Analysis
          </h4>
          <p className="text-gray-500 text-center max-w-md mb-6">
            Get AI-powered insights to help you monetize your idea effectively.
          </p>
          <Button
            onClick={() => generateAnalysis(activeTab)}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            Generate Analysis
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Summary */}
        {currentAnalysis.summary && (
          <div className="p-4 bg-violet-50 rounded-xl">
            <p className="text-violet-800">{currentAnalysis.summary}</p>
          </div>
        )}

        {/* Analysis Content */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Analysis Details</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(currentAnalysis.analysis)}
              className="gap-2"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy
            </Button>
          </div>
          <pre className="text-sm text-gray-600 whitespace-pre-wrap overflow-auto max-h-64">
            {JSON.stringify(currentAnalysis.analysis, null, 2)}
          </pre>
        </div>

        {/* Recommendations */}
        {currentAnalysis.recommendations && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Key Recommendations
            </h4>
            <ul className="space-y-2">
              {currentAnalysis.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Regenerate */}
        <Button
          variant="outline"
          onClick={() => generateAnalysis(activeTab)}
          className="w-full"
        >
          Regenerate Analysis
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Monetization Suite: {idea?.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-5 mb-4">
            {ANALYSIS_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            {renderContent()}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}