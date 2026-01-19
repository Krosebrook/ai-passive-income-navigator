import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, MoreVertical, TrendingUp, Zap, Settings, Layout, BarChart3 } from 'lucide-react';
import DealCard from '@/components/pipeline/DealCard';
import AddDealModal from '@/components/pipeline/AddDealModal';
import DealDetailsModal from '@/components/pipeline/DealDetailsModal';
import AutomationRulesManager from '@/components/pipeline/AutomationRulesManager';
import KanbanBoard from '@/components/pipeline/KanbanBoard';
import StageManager from '@/components/pipeline/StageManager';
import AnalyticsDashboard from '@/components/pipeline/AnalyticsDashboard';

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
  const [stageManagerOpen, setStageManagerOpen] = useState(false);
  const [viewMode, setViewMode] = useState('kanban');

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deal-pipeline'],
    queryFn: () => base44.entities.DealPipeline.list('-created_date')
  });

  const { data: customStages = [] } = useQuery({
    queryKey: ['deal-stages'],
    queryFn: () => base44.entities.DealStage.filter({ is_active: true }, 'order')
  });

  // Initialize default stages if none exist
  useEffect(() => {
    const initializeStages = async () => {
      if (customStages.length === 0) {
        const defaultStages = [
          { name: 'Research', order: 0, color: 'bg-blue-100 text-blue-700', is_default: true },
          { name: 'Analysis', order: 1, color: 'bg-purple-100 text-purple-700', is_default: true },
          { name: 'Negotiation', order: 2, color: 'bg-orange-100 text-orange-700', is_default: true },
          { name: 'Launch', order: 3, color: 'bg-emerald-100 text-emerald-700', is_default: true }
        ];
        
        for (const stage of defaultStages) {
          await base44.entities.DealStage.create(stage);
        }
        
        queryClient.invalidateQueries({ queryKey: ['deal-stages'] });
      }
    };
    
    initializeStages();
  }, [customStages.length]);

  const activeStages = customStages.length > 0 ? customStages : STAGES;

  const updateStageMutation = useMutation({
    mutationFn: async ({ dealId, newStage }) => {
      const deal = deals.find(d => d.id === dealId);
      const stageHistory = [...(deal.stage_history || []), {
        stage: newStage,
        entered_at: new Date().toISOString(),
        notes: `Moved to ${newStage}`
      }];

      await base44.entities.DealPipeline.update(dealId, {
        stage: newStage,
        stage_history: stageHistory
      });

      // Send notification
      try {
        await base44.functions.invoke('notifyDealUpdate', {
          dealId,
          updateType: 'stage_change',
          details: { newStage }
        });
      } catch (error) {
        console.error('Notification failed:', error);
      }

      return dealId;
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStageManagerOpen(true)}
              className="border-[#2d1e50]"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Stages
            </Button>
            <Button onClick={() => setAddModalOpen(true)} className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0]">
              <Plus className="w-4 h-4 mr-2" />
              Add Deal
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pipeline" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pipeline">
              <Layout className="w-4 h-4 mr-2" />
              Kanban View
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="automation">
              <Zap className="w-4 h-4 mr-2" />
              Automation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline">
            <KanbanBoard
              stages={activeStages}
              deals={deals}
              onDealMove={(dealId, newStage) => updateStageMutation.mutate({ dealId, newStage })}
              onDealClick={handleDealClick}
              onStageEdit={() => setStageManagerOpen(true)}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="automation">
            <AutomationRulesManager />
          </TabsContent>
        </Tabs>

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

        <StageManager
          isOpen={stageManagerOpen}
          onClose={() => setStageManagerOpen(false)}
        />
      </div>
    </div>
  );
}