import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { FileText, TrendingUp, AlertTriangle, CheckCircle2, XCircle, DollarSign, Calendar, Target } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function DealStructureComparison({ deal }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [structures, setStructures] = useState(deal?.deal_structure_variations || []);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateDealStructureVariations', {
        deal_id: deal.id
      });
      return response.data;
    },
    onSuccess: (data) => {
      setStructures(data.structures);
      queryClient.invalidateQueries({ queryKey: ['originated-deals'] });
      toast.success('Deal structures generated');
    }
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateMutation.mutateAsync();
    } finally {
      setIsGenerating(false);
    }
  };

  const getRiskColor = (score) => {
    if (score <= 3) return 'text-green-400';
    if (score <= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (structures.length === 0) {
    return (
      <Card className="border-[#2d1e50] bg-[#1a0f2e]">
        <CardContent className="py-8 text-center">
          <FileText className="w-10 h-10 text-[#64748b] mx-auto mb-3" />
          <h3 className="text-sm font-semibold mb-2">No Deal Structures Yet</h3>
          <p className="text-xs text-[#64748b] mb-4">
            Generate multiple structure variations to compare and select
          </p>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Generate Structures'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#8b85f7]">Deal Structure Options</h3>
        <Button size="sm" variant="outline" onClick={handleGenerate} disabled={isGenerating}>
          Regenerate
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {structures.map((structure, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className={`border-[#2d1e50] bg-[#1a0f2e] cursor-pointer transition-all ${
                selectedStructure === index ? 'border-[#8b85f7] ring-2 ring-[#8b85f7]/20' : 'hover:border-[#8b85f7]/30'
              }`}
              onClick={() => setSelectedStructure(index)}
            >
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{structure.structure_name || `Structure ${index + 1}`}</span>
                  {selectedStructure === index && (
                    <CheckCircle2 className="w-5 h-5 text-[#8b85f7]" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-xs text-[#64748b] mb-1">
                      <TrendingUp className="w-3 h-3" />
                      Predicted ROI
                    </div>
                    <p className="text-sm font-bold text-green-400">
                      {structure.predicted_roi || 0}%
                    </p>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-xs text-[#64748b] mb-1">
                      <AlertTriangle className="w-3 h-3" />
                      Risk Score
                    </div>
                    <p className={`text-sm font-bold ${getRiskColor(structure.risk_score)}`}>
                      {structure.risk_score || 0}/10
                    </p>
                  </div>
                </div>

                {/* Key Terms */}
                {structure.key_terms && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-[#64748b] mb-2">Key Terms</p>
                    <p className="text-xs text-[#a0aec0]">{structure.key_terms}</p>
                  </div>
                )}

                {/* Investment Amount */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748b]">Investment</span>
                  <span className="font-bold">${structure.investment_amount?.toLocaleString() || 0}</span>
                </div>

                {/* Time to Liquidity */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748b]">Time to Liquidity</span>
                  <span className="font-bold">{structure.time_to_liquidity || 'N/A'} months</span>
                </div>

                {/* Best For */}
                {structure.best_for && (
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-[#64748b] mb-1">Best For:</p>
                    <p className="text-xs text-[#a0aec0]">{structure.best_for}</p>
                  </div>
                )}

                {/* Pros/Cons Preview */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div>
                    <p className="text-xs text-green-400 mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Pros: {structure.pros?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-red-400 mb-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Cons: {structure.cons?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Selected Structure Details */}
      {selectedStructure !== null && structures[selectedStructure] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-[#8b85f7]/50 bg-[#8b85f7]/5">
            <CardHeader>
              <CardTitle className="text-base">
                {structures[selectedStructure].structure_name || `Structure ${selectedStructure + 1}`} - Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Pros */}
                <div>
                  <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Advantages
                  </h4>
                  <ul className="space-y-1">
                    {structures[selectedStructure].pros?.map((pro, i) => (
                      <li key={i} className="text-xs text-[#a0aec0] flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">✓</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons */}
                <div>
                  <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Disadvantages
                  </h4>
                  <ul className="space-y-1">
                    {structures[selectedStructure].cons?.map((con, i) => (
                      <li key={i} className="text-xs text-[#a0aec0] flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">×</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Exit Scenarios */}
              {structures[selectedStructure].exit_scenarios && (
                <div>
                  <h4 className="text-sm font-semibold text-[#8b85f7] mb-2">Exit Scenarios</h4>
                  <p className="text-xs text-[#a0aec0]">{structures[selectedStructure].exit_scenarios}</p>
                </div>
              )}

              {/* Downside Protection */}
              {structures[selectedStructure].downside_protection && (
                <div>
                  <h4 className="text-sm font-semibold text-[#8b85f7] mb-2">Downside Protection</h4>
                  <p className="text-xs text-[#a0aec0]">{structures[selectedStructure].downside_protection}</p>
                </div>
              )}

              <Button className="w-full bg-gradient-to-r from-[#8b85f7] to-[#583cf0]">
                Select This Structure
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}