import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Scale, Loader2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function DealComparisonTool({ deals, open, onClose }) {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  const runComparison = async () => {
    if (deals.length < 2) {
      toast.error('Select at least 2 deals to compare');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('compareDeals', {
        dealIds: deals.map(d => d.id)
      });
      setComparison(response.data.comparison);
    } catch (error) {
      toast.error('Failed to compare deals');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open && deals.length >= 2) {
      runComparison();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            AI Deal Comparison
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">AI is analyzing and comparing deals...</p>
          </div>
        )}

        {comparison && !loading && (
          <div className="space-y-6">
            {/* Best Overall */}
            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 mb-1">
                    Best Overall: {comparison.best_overall?.deal_title}
                  </p>
                  <p className="text-sm text-green-800">{comparison.best_overall?.reasoning}</p>
                </div>
              </div>
            </Card>

            {/* Comparison Table */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Side-by-Side Comparison</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {comparison.comparison_table?.map((item, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-gray-900">{item.deal_title}</h5>
                      <Badge className="bg-violet-600 text-white">
                        Score: {item.score}/100
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-3">
                      <p className="text-xs font-semibold text-green-700">Pros:</p>
                      {item.pros?.map((pro, i) => (
                        <p key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {pro}
                        </p>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-red-700">Cons:</p>
                      {item.cons?.map((con, i) => (
                        <p key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          {con}
                        </p>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Best for Scenarios */}
            {comparison.best_for_scenarios?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Best for Different Scenarios</h4>
                <div className="grid gap-3">
                  {comparison.best_for_scenarios.map((scenario, idx) => (
                    <Card key={idx} className="p-4 bg-gray-50">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">{scenario.scenario}</p>
                          <p className="text-sm text-gray-700 mt-1">
                            <strong>{scenario.deal_title}</strong> - {scenario.reason}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Key Differentiators */}
            {comparison.key_differentiators?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Key Differentiators</h4>
                <ul className="space-y-2">
                  {comparison.key_differentiators.map((diff, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-violet-600">•</span>
                      {diff}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Final Recommendation */}
            <Card className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
              <h4 className="font-semibold text-gray-900 mb-2">Final Recommendation</h4>
              <p className="text-sm text-gray-800">{comparison.final_recommendation}</p>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}