import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertTriangle, Lightbulb, DollarSign } from 'lucide-react';

/**
 * Financial Predictions Component
 * Displays AI-generated revenue predictions and scaling recommendations
 */
export default function FinancialPredictions({ prediction }) {
  if (!prediction) return null;

  const chartData = prediction.monthly_projections?.map(proj => ({
    month: proj.month_name?.substring(0, 3) || `M${proj.month}`,
    revenue: proj.projected_revenue,
    expenses: proj.projected_expenses,
    profit: proj.projected_profit
  })) || [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-900">Best Case</p>
            </div>
            <p className="text-2xl font-bold text-emerald-900">
              ${prediction.best_case_annual_revenue?.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-700 mt-1">Annual Revenue</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-900">Most Likely</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              ${prediction.most_likely_annual_revenue?.toLocaleString()}
            </p>
            <p className="text-xs text-blue-700 mt-1">Annual Revenue</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <p className="text-sm font-medium text-amber-900">Worst Case</p>
            </div>
            <p className="text-2xl font-bold text-amber-900">
              ${prediction.worst_case_annual_revenue?.toLocaleString()}
            </p>
            <p className="text-xs text-amber-700 mt-1">Annual Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Projection Chart */}
      <Card>
        <CardHeader>
          <CardTitle>12-Month Revenue Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scaling Recommendations */}
      {prediction.scaling_recommendations && prediction.scaling_recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-violet-600" />
              Scaling Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prediction.scaling_recommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-violet-50 rounded-lg border border-violet-200">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{rec.milestone}</h4>
                      <Badge variant="outline">{rec.when}</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{rec.action}</p>
                    <p className="text-xs text-emerald-700 font-medium">
                      📈 {rec.expected_impact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Factors */}
      {prediction.risk_factors && prediction.risk_factors.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prediction.risk_factors.map((risk, idx) => (
                <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-gray-900">{risk.factor}</p>
                    <div className="flex gap-2">
                      <Badge className={
                        risk.impact === 'high' ? 'bg-red-100 text-red-700' :
                        risk.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }>
                        {risk.impact} impact
                      </Badge>
                      <Badge variant="outline">{risk.probability}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Mitigation:</strong> {risk.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Shifts */}
      {prediction.market_shifts && prediction.market_shifts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Predicted Market Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prediction.market_shifts.map((shift, idx) => (
                <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-gray-900">{shift.shift}</p>
                    <Badge className="bg-blue-100 text-blue-700">{shift.timeframe}</Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Revenue Impact:</strong> {shift.impact_on_revenue}
                  </p>
                  <p className="text-sm text-blue-900">
                    💡 <strong>Action:</strong> {shift.recommended_response}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}