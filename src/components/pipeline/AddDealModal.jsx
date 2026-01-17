import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function AddDealModal({ open, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    deal_name: '',
    deal_description: '',
    stage: 'research',
    priority: 'medium',
    estimated_value: '',
    expected_close_date: ''
  });

  const handleSubmit = async () => {
    if (!formData.deal_name) {
      toast.error('Deal name is required');
      return;
    }

    try {
      await base44.entities.DealPipeline.create({
        ...formData,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : 0,
        stage_history: [{
          stage: formData.stage,
          entered_at: new Date().toISOString(),
          notes: 'Deal created'
        }]
      });

      queryClient.invalidateQueries({ queryKey: ['deal-pipeline'] });
      toast.success('Deal added to pipeline!');
      onClose();
      setFormData({
        deal_name: '',
        deal_description: '',
        stage: 'research',
        priority: 'medium',
        estimated_value: '',
        expected_close_date: ''
      });
    } catch (error) {
      toast.error('Failed to add deal');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Deal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Deal Name *</Label>
            <Input
              value={formData.deal_name}
              onChange={(e) => setFormData({ ...formData, deal_name: e.target.value })}
              placeholder="e.g., SaaS Product Launch"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.deal_description}
              onChange={(e) => setFormData({ ...formData, deal_description: e.target.value })}
              placeholder="Describe the opportunity..."
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Initial Stage</Label>
              <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="launch">Launch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Estimated Value ($)</Label>
              <Input
                type="number"
                value={formData.estimated_value}
                onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Expected Close Date</Label>
              <Input
                type="date"
                value={formData.expected_close_date}
                onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSubmit} className="flex-1">Add Deal</Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}