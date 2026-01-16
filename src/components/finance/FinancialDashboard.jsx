import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, TrendingUp, TrendingDown, PieChart, 
  Calculator, Plus, Brain, AlertCircle
} from 'lucide-react';
import { LineChart, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ExpenseTracker from './ExpenseTracker';
import RevenueForecast from './RevenueForecast';
import ROICalculator from './ROICalculator';
import TaxEstimator from './TaxEstimator';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function FinancialDashboard({ portfolioIdea }) {
  const [activeModal, setActiveModal] = useState(null);

  const { data: financialData = [] } = useQuery({
    queryKey: ['financialData', portfolioIdea.id],
    queryFn: () => base44.entities.FinancialData.filter({ 
      portfolio_idea_id: portfolioIdea.id 
    }, '-date')
  });

  // Calculate totals
  const totalRevenue = financialData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalExpenses = financialData.reduce((sum, d) => sum + (d.expenses || 0), 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

  // Prepare chart data
  const chartData = financialData.slice(0, 30).reverse().map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: d.revenue || 0,
    expenses: d.expenses || 0,
    profit: d.profit || 0
  }));

  // Expense breakdown
  const expenseBreakdown = financialData.reduce((acc, d) => {
    if (d.expense_breakdown) {
      Object.entries(d.expense_breakdown).forEach(([key, value]) => {
        acc[key] = (acc[key] || 0) + value;
      });
    }
    return acc;
  }, {});

  const pieData = Object.entries(expenseBreakdown).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value
  }));

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${totalExpenses.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Net Profit</p>
                  <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ${totalProfit.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Profit Margin</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {profitMargin}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setActiveModal('expense')}
          className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600"
        >
          <Plus className="w-4 h-4" />
          Track Expenses
        </Button>
        <Button
          onClick={() => setActiveModal('forecast')}
          variant="outline"
          className="gap-2"
        >
          <Brain className="w-4 h-4" />
          Revenue Forecast
        </Button>
        <Button
          onClick={() => setActiveModal('roi')}
          variant="outline"
          className="gap-2"
        >
          <Calculator className="w-4 h-4" />
          ROI Calculator
        </Button>
        <Button
          onClick={() => setActiveModal('tax')}
          variant="outline"
          className="gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          Tax Estimator
        </Button>
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Expenses Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="profit" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {pieData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {financialData.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Financial Data Yet</h3>
            <p className="text-gray-500 mb-6">Start tracking your expenses and revenue to see insights</p>
            <Button onClick={() => setActiveModal('expense')} className="gap-2">
              <Plus className="w-4 h-4" />
              Add First Entry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ExpenseTracker
        portfolioIdea={portfolioIdea}
        open={activeModal === 'expense'}
        onClose={() => setActiveModal(null)}
      />
      <RevenueForecast
        portfolioIdea={portfolioIdea}
        financialData={financialData}
        open={activeModal === 'forecast'}
        onClose={() => setActiveModal(null)}
      />
      <ROICalculator
        portfolioIdea={portfolioIdea}
        open={activeModal === 'roi'}
        onClose={() => setActiveModal(null)}
      />
      <TaxEstimator
        portfolioIdea={portfolioIdea}
        financialData={financialData}
        open={activeModal === 'tax'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}