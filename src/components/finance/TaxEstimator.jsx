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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, FileText } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const US_STATES = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'Other'];

export default function TaxEstimator({ portfolioIdea: _portfolioIdea, financialData, open, onClose }) {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    business_structure: 'sole_proprietorship',
    state: 'CA',
    filing_status: 'single'
  });
  const [estimate, setEstimate] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const queryClient = useQueryClient();

  const calculateTax = async () => {
    setIsCalculating(true);

    const totalRevenue = financialData.reduce((sum, d) => sum + (d.revenue || 0), 0);
    const totalExpenses = financialData.reduce((sum, d) => sum + (d.expenses || 0), 0);
    const netIncome = totalRevenue - totalExpenses;

    // Simplified tax calculation (this is an estimate - real taxes are complex!)
    const selfEmploymentTaxRate = 0.153; // 15.3% for SE tax
    const selfEmploymentTax = netIncome * selfEmploymentTaxRate;

    // Estimate federal tax (very simplified progressive tax)
    let federalTax = 0;
    if (netIncome > 0) {
      if (netIncome <= 10000) federalTax = netIncome * 0.10;
      else if (netIncome <= 40000) federalTax = 1000 + (netIncome - 10000) * 0.12;
      else if (netIncome <= 85000) federalTax = 4600 + (netIncome - 40000) * 0.22;
      else federalTax = 14500 + (netIncome - 85000) * 0.24;
    }

    // Estimate state tax (very simplified - varies greatly by state)
    const stateTaxRates = {
      'CA': 0.093,
      'NY': 0.0685,
      'TX': 0,
      'FL': 0,
      'IL': 0.0495,
      'Other': 0.05
    };
    const stateTax = netIncome * (stateTaxRates[formData.state] || 0.05);

    const totalTax = federalTax + stateTax + selfEmploymentTax;

    const result = {
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_income: netIncome,
      estimated_federal_tax: federalTax,
      estimated_state_tax: stateTax,
      estimated_self_employment_tax: selfEmploymentTax,
      total_estimated_tax: totalTax,
      effective_tax_rate: netIncome > 0 ? ((totalTax / netIncome) * 100).toFixed(2) : 0,
      net_after_tax: netIncome - totalTax
    };

    setEstimate(result);
    setIsCalculating(false);
  };

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.TaxEstimate.create(data),
    onSuccess: () => {
      toast.success('Tax estimate saved');
      queryClient.invalidateQueries({ queryKey: ['taxEstimates'] });
    }
  });

  const handleSave = () => {
    saveMutation.mutate({
      year: formData.year,
      quarter: Math.ceil(new Date().getMonth() / 3),
      business_structure: formData.business_structure,
      state: formData.state,
      ...estimate
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tax Estimator</DialogTitle>
        </DialogHeader>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Disclaimer</p>
              <p>
                This is a simplified tax estimate for planning purposes only. 
                Actual taxes depend on many factors. Consult a tax professional for accurate advice.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Tax Year</Label>
            <Input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              min="2020"
              max="2030"
            />
          </div>

          <div>
            <Label>Business Structure</Label>
            <Select
              value={formData.business_structure}
              onValueChange={(value) => setFormData({ ...formData, business_structure: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                <SelectItem value="llc">LLC</SelectItem>
                <SelectItem value="s_corp">S Corporation</SelectItem>
                <SelectItem value="c_corp">C Corporation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>State</Label>
            <Select
              value={formData.state}
              onValueChange={(value) => setFormData({ ...formData, state: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={calculateTax} disabled={isCalculating} className="w-full">
            {isCalculating ? 'Calculating...' : 'Calculate Tax Estimate'}
          </Button>
        </div>

        {estimate && (
          <div className="mt-6 space-y-4">
            {/* Summary */}
            <div className="p-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-white">
              <div className="text-center">
                <p className="text-sm opacity-90 mb-1">Estimated Total Tax</p>
                <p className="text-4xl font-bold">${estimate.total_estimated_tax.toLocaleString()}</p>
                <p className="text-sm opacity-90 mt-1">Effective rate: {estimate.effective_tax_rate}%</p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-600 mb-1">Federal Tax</p>
                <p className="text-xl font-bold text-blue-900">
                  ${estimate.estimated_federal_tax.toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-purple-600 mb-1">State Tax</p>
                <p className="text-xl font-bold text-purple-900">
                  ${estimate.estimated_state_tax.toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-sm text-amber-600 mb-1">Self-Employment</p>
                <p className="text-xl font-bold text-amber-900">
                  ${estimate.estimated_self_employment_tax.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Income Summary */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Revenue:</span>
                <span className="font-semibold text-gray-900">
                  ${estimate.total_revenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Expenses:</span>
                <span className="font-semibold text-gray-900">
                  -${estimate.total_expenses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-gray-600">Net Income:</span>
                <span className="font-semibold text-gray-900">
                  ${estimate.net_income.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimated Tax:</span>
                <span className="font-semibold text-red-600">
                  -${estimate.total_estimated_tax.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold text-gray-900">Net After Tax:</span>
                <span className="font-bold text-green-600">
                  ${estimate.net_after_tax.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleSave} variant="outline" className="flex-1 gap-2">
                <FileText className="w-4 h-4" />
                Save Estimate
              </Button>
              <Button onClick={calculateTax} variant="outline" className="flex-1">
                Recalculate
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}