import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export default function InvestmentList({ investments }) {
  return (
    <Card className="card-dark">
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] bg-clip-text text-transparent">
          Your Investments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {investments.map((investment) => {
            const roi = investment.actual_roi || 0;
            const isPositive = roi >= 0;

            return (
              <div
                key={investment.id}
                className="p-4 rounded-xl border border-[#2d1e50] bg-[#0f0618] hover:border-[#8b85f7] transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{investment.investment_name}</h3>
                    <p className="text-sm text-gray-400">{investment.industry}</p>
                  </div>
                  <Badge className={investment.status === 'active' ? 'badge-success' : 'badge-warning'}>
                    {investment.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Initial Investment</p>
                    <p className="text-white font-medium">${investment.initial_investment.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Current Value</p>
                    <p className="text-white font-medium">
                      ${(investment.current_value || investment.initial_investment).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">ROI</p>
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <p className={`font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {roi.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Investment Date</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <p className="text-white text-sm">
                        {new Date(investment.investment_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}