import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, AlertTriangle, Wrench, Map, 
  Loader2, Sparkles, CheckCircle, Download
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ENRICHMENT_SECTIONS = [
  { id: 'business_plan', label: 'Business Plan', icon: FileText },
  { id: 'risks', label: 'Risk Analysis', icon: AlertTriangle },
  { id: 'ai_tools', label: 'AI Tools', icon: Wrench },
  { id: 'roadmap', label: 'Roadmap', icon: Map }
];

export default function EnrichmentModal({ idea, open, onClose, existingEnrichment }) {
  const [activeTab, setActiveTab] = useState('business_plan');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [enrichment, setEnrichment] = useState(existingEnrichment || null);

  const generateEnrichment = async () => {
    setIsLoading(true);
    setProgress(0);

    const sections = ['business_plan', 'risks', 'ai_tools', 'roadmap'];
    const results = {};

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      setProgress(((i) / sections.length) * 100);

      const prompts = {
        business_plan: `Create a comprehensive business plan for: "${idea.title}". Description: ${idea.description}. Include sections: Executive Summary, Market Analysis, Product/Service Description, Marketing Strategy, Financial Projections (first year), Implementation Timeline.`,
        risks: `Identify and analyze risks for business idea: "${idea.title}". Categories: Market risks, Financial risks, Operational risks, Competition risks, Regulatory risks. For each risk provide: description, severity (low/medium/high), mitigation strategy.`,
        ai_tools: `Recommend AI tools and software for: "${idea.title}". For each tool provide: name, purpose, pricing tier, priority (essential/recommended/optional), use case description.`,
        roadmap: `Create an implementation roadmap for: "${idea.title}". Divide into 4 phases over 12 months. For each phase include: duration, key tasks, cost estimates, milestones.`
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompts[section],
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            [section]: { type: 'array', items: { type: 'object' } }
          }
        }
      });

      results[section] = response[section] || [];
    }

    setProgress(100);

    // Save enrichment
    const savedEnrichment = await base44.entities.IdeaEnrichment.create({
      portfolio_idea_id: idea.id,
      idea_title: idea.title,
      enrichment_type: 'full_enrichment',
      business_plan: results.business_plan,
      risks: results.risks,
      ai_tools: results.ai_tools,
      roadmap: results.roadmap,
      is_active: true
    });

    setEnrichment({ ...results, id: savedEnrichment.id });
    setIsLoading(false);
  };

  const renderSection = (sectionId) => {
    const data = enrichment?.[sectionId];
    
    if (!data || data.length === 0) return null;

    switch (sectionId) {
      case 'business_plan':
        return (
          <div className="space-y-4">
            {data.map((section, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">{section.section || section.title}</h4>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{section.content || section.description}</p>
              </div>
            ))}
          </div>
        );

      case 'risks':
        return (
          <div className="space-y-3">
            {data.map((risk, i) => (
              <div key={i} className={`p-4 rounded-xl border-l-4 ${
                risk.severity === 'high' ? 'bg-red-50 border-red-500' :
                risk.severity === 'medium' ? 'bg-amber-50 border-amber-500' :
                'bg-green-50 border-green-500'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{risk.category || risk.risk}</h4>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    risk.severity === 'high' ? 'bg-red-100 text-red-700' :
                    risk.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {risk.severity}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{risk.description || risk.risk}</p>
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Mitigation: </span>
                  <span className="text-gray-600">{risk.mitigation}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'ai_tools':
        return (
          <div className="grid gap-3">
            {data.map((tool, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      tool.priority === 'essential' ? 'bg-red-100 text-red-700' :
                      tool.priority === 'recommended' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {tool.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{tool.purpose}</p>
                  <p className="text-xs text-gray-500">{tool.pricing}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'roadmap':
        return (
          <div className="space-y-4">
            {data.map((phase, i) => (
              <div key={i} className="relative pl-8 pb-8 border-l-2 border-violet-200 last:pb-0">
                <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-violet-500" />
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{phase.phase}</h4>
                    <span className="text-sm text-gray-500">{phase.duration}</span>
                  </div>
                  <ul className="space-y-1 mb-3">
                    {phase.tasks?.map((task, j) => (
                      <li key={j} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                        {task}
                      </li>
                    ))}
                  </ul>
                  {phase.cost_estimate && (
                    <p className="text-sm text-emerald-600 font-medium">
                      Est. Cost: {phase.cost_estimate}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            AI Enrichment: {idea?.title}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium mb-2">Generating enrichment...</p>
            <p className="text-sm text-gray-500 mb-6">
              Analyzing business plan, risks, tools, and roadmap
            </p>
            <div className="w-full max-w-xs">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-400 mt-2 text-center">{Math.round(progress)}% complete</p>
            </div>
          </div>
        ) : !enrichment ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Idea Enrichment</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Generate a comprehensive business plan, risk analysis, recommended AI tools, 
              and implementation roadmap for your idea.
            </p>
            <Button
              onClick={generateEnrichment}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate Full Enrichment
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid grid-cols-4 mb-4">
              {ENRICHMENT_SECTIONS.map((section) => {
                const Icon = section.icon;
                const hasData = enrichment?.[section.id]?.length > 0;
                return (
                  <TabsTrigger key={section.id} value={section.id} className="gap-2 relative">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{section.label}</span>
                    {hasData && (
                      <CheckCircle className="w-3 h-3 text-green-500 absolute -top-1 -right-1" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              {renderSection(activeTab)}
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}