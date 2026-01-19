import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const COLOR_OPTIONS = [
  { value: 'bg-blue-100 text-blue-700', label: 'Blue' },
  { value: 'bg-purple-100 text-purple-700', label: 'Purple' },
  { value: 'bg-orange-100 text-orange-700', label: 'Orange' },
  { value: 'bg-emerald-100 text-emerald-700', label: 'Green' },
  { value: 'bg-pink-100 text-pink-700', label: 'Pink' },
  { value: 'bg-amber-100 text-amber-700', label: 'Amber' },
  { value: 'bg-cyan-100 text-cyan-700', label: 'Cyan' }
];

export default function StageManager({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [newStage, setNewStage] = useState({ name: '', color: COLOR_OPTIONS[0].value });

  const { data: stages = [] } = useQuery({
    queryKey: ['deal-stages'],
    queryFn: () => base44.entities.DealStage.list('order')
  });

  const createStageMutation = useMutation({
    mutationFn: (stageData) => base44.entities.DealStage.create({
      ...stageData,
      order: stages.length
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-stages'] });
      setNewStage({ name: '', color: COLOR_OPTIONS[0].value });
      toast.success('Stage created');
    }
  });

  const deleteStageMutation = useMutation({
    mutationFn: (stageId) => base44.entities.DealStage.delete(stageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-stages'] });
      toast.success('Stage deleted');
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a0f2e] border-[#2d1e50] text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Pipeline Stages</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Existing Stages */}
          <div className="space-y-2">
            {stages.map((stage, idx) => (
              <div key={stage.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                <GripVertical className="w-4 h-4 text-gray-500 cursor-move" />
                <Badge className={stage.color}>{stage.name}</Badge>
                <span className="text-xs text-gray-500 ml-auto">Order: {idx + 1}</span>
                {!stage.is_default && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteStageMutation.mutate(stage.id)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Add New Stage */}
          <div className="card-dark p-4 space-y-3">
            <h4 className="font-semibold text-sm">Add New Stage</h4>
            <div>
              <Label>Stage Name</Label>
              <Input
                value={newStage.name}
                onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
                placeholder="e.g., Due Diligence"
              />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COLOR_OPTIONS.map(color => (
                  <Badge
                    key={color.value}
                    onClick={() => setNewStage({ ...newStage, color: color.value })}
                    className={`cursor-pointer ${
                      newStage.color === color.value ? color.value : 'bg-[#0f0618] text-gray-400'
                    }`}
                  >
                    {color.label}
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              onClick={() => createStageMutation.mutate(newStage)}
              disabled={!newStage.name || createStageMutation.isPending}
              className="w-full bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Stage
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}