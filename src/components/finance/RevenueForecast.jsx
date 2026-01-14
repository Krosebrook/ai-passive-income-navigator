import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RevenueForecast({ portfolioIdea, financialData, open, onClose }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [forecast, setForecast] = useState(null);

  const generateForecast = async () => {
    setIsGenerating(true);

    const historicalData = financialData.map(d => ({
      date: d.date,
      revenue: d.revenue,
      expenses: d.expenses,
      profit: d.profit
    }));

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this historical financial data for "${portfolioIdea.title}":
${JSON.stringify(historicalData, null, 2)}

Generate a 12-month revenue forecast with AI analysis. Include:
1. Monthly revenue predictions (next 12 months)
2. Growth rate assumptions
3. Key factors affecting growth
4. Best case, realistic, and worst case scenarios
5. Recommendations for increasing revenue`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          monthly_forecast: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                month: { type: 'string' },
                predicted_revenue: { type: 'number' },
                best_case: { type: 'number' },
                worst_case: { type: 'number' }
              }
            }
          },
          growth_rate: { type: 'string' },
          key_factors: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } },
          summary: { type: 'string' }
        }
      }
    });

    setForecast(response);
    setIsGenerating(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Revenue Forecast</DialogTitle>
        </DialogHeader>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
            <p className="text-gray-500">Analyzing financial data and generating forecast...</p>
          </div>
        ) : !forecast ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-violet-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Revenue Forecast</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Use AI to predict your revenue for the next 12 months based on historical data
            </p>
            <Button onClick={generateForecast} className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Generate Forecast
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 bg-violet-50 rounded-xl">
              <p className="text-violet-800">{forecast.summary}</p>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl p-4 border">
              <h4 className="font-semibold mb-4">12-Month Revenue Projection</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecast.monthly_forecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="predicted_revenue" stroke="#8b5cf6" strokeWidth={2} name="Predicted" />
                  <Line type="monotone" dataKey="best_case" stroke="#10b981" strokeWidth={1} strokeDasharray="5 5" name="Best Case" />
                  <Line type="monotone" dataKey="worst_case" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" name="Worst Case" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Growth Rate */}
            <div className="bg-emerald-50 rounded-xl p-4">
              <h4 className="font-semibold text-emerald-900 mb-2">Expected Growth Rate</h4>
              <p className="text-emerald-700">{forecast.growth_rate}</p>
            </div>

            {/* Key Factors */}
            <div>
              <h4 className="font-semibold mb-3">Key Growth Factors</h4>
              <ul className="space-y-2">
                {forecast.key_factors.map((factor, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {forecast.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button variant="outline" onClick={generateForecast} className="w-full">
              Regenerate Forecast
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}