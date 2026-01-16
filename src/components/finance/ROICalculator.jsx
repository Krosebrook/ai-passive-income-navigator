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
import { Calculator, TrendingUp } from 'lucide-react';

export default function ROICalculator({ portfolioIdea: _portfolioIdea, open, onClose }) {
  const [formData, setFormData] = useState({
    initial_investment: '',
    monthly_revenue: '',
    monthly_expenses: '',
    time_period_months: 12
  });
  const [result, setResult] = useState(null);

  const calculateROI = (e) => {
    e.preventDefault();
    
    const initialInvestment = parseFloat(formData.initial_investment);
    const monthlyRevenue = parseFloat(formData.monthly_revenue);
    const monthlyExpenses = parseFloat(formData.monthly_expenses);
    const months = parseInt(formData.time_period_months);
    
    const totalRevenue = monthlyRevenue * months;
    const totalExpenses = monthlyExpenses * months;
    const netProfit = totalRevenue - totalExpenses - initialInvestment;
    const roi = ((netProfit / initialInvestment) * 100).toFixed(2);
    const breakEvenMonths = initialInvestment / (monthlyRevenue - monthlyExpenses);
    const monthlyProfit = monthlyRevenue - monthlyExpenses;
    const annualROI = ((monthlyProfit * 12 - initialInvestment) / initialInvestment * 100).toFixed(2);

    setResult({
      totalRevenue,
      totalExpenses,
      netProfit,
      roi,
      breakEvenMonths: breakEvenMonths.toFixed(1),
      monthlyProfit,
      annualROI,
      profitMargin: ((monthlyProfit / monthlyRevenue) * 100).toFixed(1)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>ROI Calculator</DialogTitle>
        </DialogHeader>

        <form onSubmit={calculateROI} className="space-y-6">
          <div>
            <Label>Initial Investment ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.initial_investment}
              onChange={(e) => setFormData({ ...formData, initial_investment: e.target.value })}
              placeholder="e.g., 5000"
              required
            />
          </div>

          <div>
            <Label>Expected Monthly Revenue ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.monthly_revenue}
              onChange={(e) => setFormData({ ...formData, monthly_revenue: e.target.value })}
              placeholder="e.g., 2000"
              required
            />
          </div>

          <div>
            <Label>Expected Monthly Expenses ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.monthly_expenses}
              onChange={(e) => setFormData({ ...formData, monthly_expenses: e.target.value })}
              placeholder="e.g., 800"
              required
            />
          </div>

          <div>
            <Label>Time Period (months)</Label>
            <Input
              type="number"
              value={formData.time_period_months}
              onChange={(e) => setFormData({ ...formData, time_period_months: e.target.value })}
              min="1"
              max="60"
              required
            />
          </div>

          <Button type="submit" className="w-full gap-2">
            <Calculator className="w-4 h-4" />
            Calculate ROI
          </Button>
        </form>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-white">
              <div className="text-center">
                <p className="text-sm opacity-90 mb-1">Return on Investment</p>
                <p className="text-4xl font-bold">{result.roi}%</p>
                <p className="text-sm opacity-90 mt-1">over {formData.time_period_months} months</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-green-600 mb-1">Net Profit</p>
                <p className="text-2xl font-bold text-green-900">
                  ${result.netProfit.toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-600 mb-1">Break Even</p>
                <p className="text-2xl font-bold text-blue-900">
                  {result.breakEvenMonths} months
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-purple-600 mb-1">Monthly Profit</p>
                <p className="text-2xl font-bold text-purple-900">
                  ${result.monthlyProfit.toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-sm text-amber-600 mb-1">Profit Margin</p>
                <p className="text-2xl font-bold text-amber-900">
                  {result.profitMargin}%
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold mb-2">Annual ROI</h4>
              <p className="text-2xl font-bold text-gray-900">{result.annualROI}%</p>
              <p className="text-sm text-gray-600 mt-1">
                Projected return over one year period
              </p>
            </div>

            {parseFloat(result.roi) < 0 && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-red-800 text-sm">
                  ⚠️ Negative ROI indicates that you won't recover your initial investment in this timeframe. 
                  Consider adjusting your revenue expectations or reducing expenses.
                </p>
              </div>
            )}

            {parseFloat(result.roi) >= 100 && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-emerald-800 text-sm flex items-start gap-2">
                  <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    Excellent ROI! This idea has strong profit potential. Make sure your revenue 
                    and expense projections are realistic.
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}