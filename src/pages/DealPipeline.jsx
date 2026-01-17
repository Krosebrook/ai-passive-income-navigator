import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, MoreVertical, TrendingUp } from 'lucide-react';
import DealCard from '@/components/pipeline/DealCard';
import AddDealModal from '@/components/pipeline/AddDealModal';
import DealDetailsModal from '@/components/pipeline/DealDetailsModal';

const STAGES = [
  { id: 'research', label: 'Research', color: 'bg-blue-100 text-blue-700' },
  { id: 'analysis', label: 'Analysis', color: 'bg-purple-100 text-purple-700' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-700' },
  { id: 'launch', label: 'Launch', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-700' }
];

export default function DealPipelinePage() {
  const queryClient = useQueryClient();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deal-pipeline'],
    queryFn: () => base44.entities.DealPipeline.list('-created_date')
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ dealId, newStage }) => {
      const deal = deals.find(d => d.id === dealId);
      const stageHistory = [...(deal.stage_history || []), {
        stage: newStage,
        entered_at: new Date().toISOString(),
        notes: `Moved to ${newStage}`
      }];

      return await base44.entities.DealPipeline.update(dealId, {
        stage: newStage,
        stage_history: stageHistory
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-pipeline'] });
      toast.success('Deal stage updated');
    }
  });

  const handleDealClick = (deal) => {
    setSelectedDeal(deal);
    setDetailsModalOpen(true);
  };

  const getDealsByStage = (stage) => {
    return deals.filter(d => d.stage === stage);
  };

  const totalValue = deals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Deal Pipeline</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">{deals.length} active deals</span>
              <span className="text-gray-400">•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                ${totalValue.toLocaleString()} total value
              </span>
            </div>
          </div>
          <Button onClick={() => setAddModalOpen(true)} className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0]">
            <Plus className="w-4 h-4 mr-2" />
            Add Deal
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {STAGES.map(stage => {
            const stageDeals = getDealsByStage(stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);

            return (
              <div key={stage.id} className="flex flex-col">
                <Card className="bg-[#1a0f2e] border-[#2d1e50] mb-3">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <Badge className={stage.color}>{stage.label}</Badge>
                      <span className="text-sm text-gray-400">{stageDeals.length}</span>
                    </div>
                    {stageValue > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        ${stageValue.toLocaleString()}
                      </p>
                    )}
                  </CardHeader>
                </Card>

                <div className="space-y-3 flex-1">
                  {stageDeals.map(deal => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onClick={() => handleDealClick(deal)}
                      onStageChange={(newStage) => updateStageMutation.mutate({ 
                        dealId: deal.id, 
                        newStage 
                      })}
                    />
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="text-center py-8 text-gray-600 text-sm">
                      No deals in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <AddDealModal 
          open={addModalOpen} 
          onClose={() => setAddModalOpen(false)} 
        />

        {selectedDeal && (
          <DealDetailsModal
            open={detailsModalOpen}
            onClose={() => {
              setDetailsModalOpen(false);
              setSelectedDeal(null);
            }}
            deal={selectedDeal}
          />
        )}
      </div>
    </div>
  );
}