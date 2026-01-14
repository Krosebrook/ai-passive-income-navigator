import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp } from 'lucide-react';

export default function FinancialProjectionsTool({ ideaTitle, financialData = {}, onClose, open }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [projections, setProjections] = useState(null);
  const [formData, setFormData] = useState({
    currentRevenue: financialData.currentRevenue || 0,
    currentExpenses: financialData.currentExpenses || 0,
    growthRate: '15%',
    marketData: 'General passive income market'
  });

  const generateProjections = async () => {
    setIsGenerating(true);
    const response = await base44.functions.invoke('generateFinancialProjections', {
      ideaTitle,
      currentRevenue: parseFloat(formData.currentRevenue),
      currentExpenses: parseFloat(formData.currentExpenses),
      growthRate: formData.growthRate,
      marketData: formData.marketData
    });
    setProjections(response.data);
    setIsGenerating(false);
  };

  const chartData = projections?.monthly_projections?.map(mp => ({
    month: `M${mp.month}`,
    moderate: Math.round(mp.revenue_moderate),
    profit: Math.round(mp.profit_moderate),
    roi: mp.roi_percentage?.toFixed(1)
  })) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            12-Month Financial Projections
          </DialogTitle>
        </DialogHeader>

        {!projections ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Current Monthly Revenue</label>
                <Input
                  type="number"
                  value={formData.currentRevenue}
                  onChange={(e) => setFormData({ ...formData, currentRevenue: e.target.value })}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Current Monthly Expenses</label>
                <Input
                  type="number"
                  value={formData.currentExpenses}
                  onChange={(e) => setFormData({ ...formData, currentExpenses: e.target.value })}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Expected Monthly Growth Rate</label>
              <Input
                value={formData.growthRate}
                onChange={(e) => setFormData({ ...formData, growthRate: e.target.value })}
                placeholder="e.g., 10% or 15%"
              />
            </div>

            <Button
              onClick={generateProjections}
              disabled={isGenerating}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Generate Projections
                </>
              )}
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Summary */}
            {projections.summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-600">Break-Even Month</p>
                    <p className="text-2xl font-bold text-green-600">Month {projections.summary.break_even_month}</p>
                  </CardContent>
                </Card>
                <Card className="border-violet-200 bg-violet-50">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-600">Year-End Revenue (Moderate)</p>
                    <p className="text-2xl font-bold text-violet-600">${projections.summary.year_end_revenue?.moderate?.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Revenue Chart */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Revenue & Profit Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="moderate" stroke="#8b5cf6" name="Revenue" />
                      <Line type="monotone" dataKey="profit" stroke="#10b981" name="Profit" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Monthly Breakdown */}
            {projections.monthly_projections && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Monthly Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-2 px-2">Month</th>
                          <th className="text-right py-2 px-2">Revenue</th>
                          <th className="text-right py-2 px-2">Expenses</th>
                          <th className="text-right py-2 px-2">Profit</th>
                          <th className="text-right py-2 px-2">ROI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {projections.monthly_projections.slice(0, 6).map((mp, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="py-2 px-2">Month {mp.month}</td>
                            <td className="text-right py-2 px-2 font-medium">${Math.round(mp.revenue_moderate).toLocaleString()}</td>
                            <td className="text-right py-2 px-2">${Math.round(mp.expenses).toLocaleString()}</td>
                            <td className="text-right py-2 px-2 font-medium text-green-600">${Math.round(mp.profit_moderate).toLocaleString()}</td>
                            <td className="text-right py-2 px-2">{mp.roi_percentage?.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Risk Factors */}
            {projections.risk_factors && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-sm">Risk Factors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {projections.risk_factors.map((risk, idx) => (
                    <div key={idx} className="text-xs">
                      <p className="font-medium text-gray-900">{risk.risk}</p>
                      <p className="text-gray-600">Impact: <span className="font-medium uppercase">{risk.impact}</span></p>
                      <p className="text-gray-600">Mitigation: {risk.mitigation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Button
              onClick={() => setProjections(null)}
              variant="outline"
              className="w-full"
            >
              Back
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}