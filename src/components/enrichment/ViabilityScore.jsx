import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingUp, Zap } from 'lucide-react';

export default function ViabilityScore({ score, analysis }) {
  if (!score || typeof score !== 'number') return null;

  const getScoreColor = (value) => {
    if (value >= 80) return 'text-emerald-600';
    if (value >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreLabel = (value) => {
    if (value >= 80) return 'Highly Viable';
    if (value >= 60) return 'Moderately Viable';
    return 'High Risk';
  };

  const getScoreBg = (value) => {
    if (value >= 80) return 'bg-emerald-50 border-emerald-200';
    if (value >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <Card className={`border-2 ${getScoreBg(score)}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Viability Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${(score / 100) * 251.2} 251.2`}
                className={getScoreColor(score)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</p>
                <p className="text-xs text-gray-600">/ 100</p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <p className={`text-lg font-semibold ${getScoreColor(score)} mb-2`}>
              {getScoreLabel(score)}
            </p>
            <p className="text-sm text-gray-600">
              Based on market trends, competition analysis, and profitability potential.
            </p>
          </div>
        </div>

        {analysis && (
          <div className="space-y-3">
            {analysis.opportunities && analysis.opportunities.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Key Opportunities
                </h4>
                <ul className="space-y-1">
                  {analysis.opportunities.slice(0, 3).map((opp, i) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      {opp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.risks && analysis.risks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Key Risks
                </h4>
                <ul className="space-y-1">
                  {analysis.risks.slice(0, 3).map((risk, i) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}