import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ExpenseTracker({ portfolioIdea, open, onClose }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    revenue: 0,
    software_tools: 0,
    advertising: 0,
    contractors: 0,
    hosting: 0,
    other_expense: 0,
    product_sales: 0,
    subscriptions: 0,
    affiliate: 0,
    services: 0,
    other_revenue: 0,
    notes: ''
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FinancialData.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialData'] });
      toast.success('Financial data saved');
      onClose();
      setFormData({
        date: new Date().toISOString().split('T')[0],
        revenue: 0,
        software_tools: 0,
        advertising: 0,
        contractors: 0,
        hosting: 0,
        other_expense: 0,
        product_sales: 0,
        subscriptions: 0,
        affiliate: 0,
        services: 0,
        other_revenue: 0,
        notes: ''
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const totalExpenses = 
      parseFloat(formData.software_tools) +
      parseFloat(formData.advertising) +
      parseFloat(formData.contractors) +
      parseFloat(formData.hosting) +
      parseFloat(formData.other_expense);
    
    const totalRevenue = 
      parseFloat(formData.product_sales) +
      parseFloat(formData.subscriptions) +
      parseFloat(formData.affiliate) +
      parseFloat(formData.services) +
      parseFloat(formData.other_revenue);

    createMutation.mutate({
      portfolio_idea_id: portfolioIdea.id,
      date: formData.date,
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: totalRevenue - totalExpenses,
      expense_breakdown: {
        software_tools: parseFloat(formData.software_tools),
        advertising: parseFloat(formData.advertising),
        contractors: parseFloat(formData.contractors),
        hosting: parseFloat(formData.hosting),
        other: parseFloat(formData.other_expense)
      },
      revenue_sources: {
        product_sales: parseFloat(formData.product_sales),
        subscriptions: parseFloat(formData.subscriptions),
        affiliate: parseFloat(formData.affiliate),
        services: parseFloat(formData.services),
        other: parseFloat(formData.other_revenue)
      },
      notes: formData.notes
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Track Financial Data</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          {/* Revenue Sources */}
          <div>
            <h3 className="font-semibold text-lg mb-3 text-green-600">Revenue Sources</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Product Sales ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.product_sales}
                  onChange={(e) => setFormData({ ...formData, product_sales: e.target.value })}
                />
              </div>
              <div>
                <Label>Subscriptions ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.subscriptions}
                  onChange={(e) => setFormData({ ...formData, subscriptions: e.target.value })}
                />
              </div>
              <div>
                <Label>Affiliate ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.affiliate}
                  onChange={(e) => setFormData({ ...formData, affiliate: e.target.value })}
                />
              </div>
              <div>
                <Label>Services ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                />
              </div>
              <div>
                <Label>Other Revenue ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.other_revenue}
                  onChange={(e) => setFormData({ ...formData, other_revenue: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div>
            <h3 className="font-semibold text-lg mb-3 text-red-600">Expenses</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Software & Tools ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.software_tools}
                  onChange={(e) => setFormData({ ...formData, software_tools: e.target.value })}
                />
              </div>
              <div>
                <Label>Advertising ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.advertising}
                  onChange={(e) => setFormData({ ...formData, advertising: e.target.value })}
                />
              </div>
              <div>
                <Label>Contractors ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.contractors}
                  onChange={(e) => setFormData({ ...formData, contractors: e.target.value })}
                />
              </div>
              <div>
                <Label>Hosting ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.hosting}
                  onChange={(e) => setFormData({ ...formData, hosting: e.target.value })}
                />
              </div>
              <div>
                <Label>Other Expenses ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.other_expense}
                  onChange={(e) => setFormData({ ...formData, other_expense: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about this financial entry..."
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Save Entry'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}