import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Plus, Search, Trash2, Eye, Sparkles } from 'lucide-react';

const INDUSTRIES = [
  'SaaS', 'E-commerce', 'Content Sites', 'Mobile Apps', 
  'Digital Products', 'Affiliate Marketing', 'Amazon FBA',
  'Dropshipping', 'Print on Demand', 'Online Courses'
];

export default function DealSourcingCriteriaManager({ onSourceDeals }) {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCriteria, setNewCriteria] = useState({
    criteria_name: '',
    min_investment: 1000,
    max_investment: 50000,
    risk_tolerance: 'medium',
    desired_roi_percentage: 25,
    preferred_industries: [],
    time_to_profitability_months: 6,
    passive_level: 'semi_passive'
  });

  const { data: criteriaList = [] } = useQuery({
    queryKey: ['deal-sourcing-criteria'],
    queryFn: () => base44.entities.DealSourcingCriteria.list('-created_date')
  });

  const createCriteriaMutation = useMutation({
    mutationFn: (data) => base44.entities.DealSourcingCriteria.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-sourcing-criteria'] });
      setShowCreateModal(false);
      setNewCriteria({
        criteria_name: '',
        min_investment: 1000,
        max_investment: 50000,
        risk_tolerance: 'medium',
        desired_roi_percentage: 25,
        preferred_industries: [],
        time_to_profitability_months: 6,
        passive_level: 'semi_passive'
      });
      toast.success('Criteria saved');
    }
  });

  const deleteCriteriaMutation = useMutation({
    mutationFn: (id) => base44.entities.DealSourcingCriteria.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-sourcing-criteria'] });
      toast.success('Criteria deleted');
    }
  });

  const toggleIndustry = (industry) => {
    const current = newCriteria.preferred_industries || [];
    if (current.includes(industry)) {
      setNewCriteria({
        ...newCriteria,
        preferred_industries: current.filter(i => i !== industry)
      });
    } else {
      setNewCriteria({
        ...newCriteria,
        preferred_industries: [...current, industry]
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Sourcing Criteria</h3>
        <Button onClick={() => setShowCreateModal(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Criteria
        </Button>
      </div>

      <div className="grid gap-3">
        {criteriaList.map((criteria) => (
          <Card key={criteria.id} className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white mb-1">{criteria.criteria_name}</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-white">
                      ${criteria.min_investment?.toLocaleString()} - ${criteria.max_investment?.toLocaleString()}
                    </Badge>
                    <Badge className="bg-blue-600 text-white">
                      {criteria.risk_tolerance} risk
                    </Badge>
                    <Badge className="bg-green-600 text-white">
                      {criteria.desired_roi_percentage}% ROI
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onSourceDeals(criteria.id)}
                    className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
                  >
                    <Search className="w-3 h-3 mr-1" />
                    Source Deals
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteCriteriaMutation.mutate(criteria.id)}
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
              </div>
              {criteria.preferred_industries?.length > 0 && (
                <div className="text-sm text-gray-400">
                  Industries: {criteria.preferred_industries.join(', ')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Criteria Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Deal Sourcing Criteria</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Criteria Name</label>
              <Input
                value={newCriteria.criteria_name}
                onChange={(e) => setNewCriteria({ ...newCriteria, criteria_name: e.target.value })}
                placeholder="e.g., Low-risk SaaS deals"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Min Investment ($)</label>
                <Input
                  type="number"
                  value={newCriteria.min_investment}
                  onChange={(e) => setNewCriteria({ ...newCriteria, min_investment: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max Investment ($)</label>
                <Input
                  type="number"
                  value={newCriteria.max_investment}
                  onChange={(e) => setNewCriteria({ ...newCriteria, max_investment: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Risk Tolerance</label>
                <Select
                  value={newCriteria.risk_tolerance}
                  onValueChange={(value) => setNewCriteria({ ...newCriteria, risk_tolerance: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Desired ROI (%)</label>
                <Input
                  type="number"
                  value={newCriteria.desired_roi_percentage}
                  onChange={(e) => setNewCriteria({ ...newCriteria, desired_roi_percentage: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Preferred Industries</label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((industry) => (
                  <Badge
                    key={industry}
                    onClick={() => toggleIndustry(industry)}
                    className={`cursor-pointer ${
                      newCriteria.preferred_industries?.includes(industry)
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Passive Level</label>
              <Select
                value={newCriteria.passive_level}
                onValueChange={(value) => setNewCriteria({ ...newCriteria, passive_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fully_passive">Fully Passive</SelectItem>
                  <SelectItem value="semi_passive">Semi-Passive</SelectItem>
                  <SelectItem value="active">Active Management OK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => createCriteriaMutation.mutate(newCriteria)}
              disabled={!newCriteria.criteria_name}
              className="w-full"
            >
              Create Criteria
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}