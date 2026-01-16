import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, DollarSign, Target, Rocket } from 'lucide-react';

/**
 * Emerging Niches Component
 * AI-generated analysis of emerging passive income niches with predictions
 */
export default function EmergingNiches({ niches = [] }) {
  const getCompetitionColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!niches || niches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-violet-600" />
        <h2 className="text-xl font-bold text-gray-900">AI-Predicted Emerging Niches</h2>
      </div>

      <div className="grid gap-4">
        {niches.map((niche, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-l-4 border-l-violet-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{niche.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{niche.description}</p>
                  </div>
                  <Badge className={`${getCompetitionColor(niche.competition_level)} ml-4`}>
                    {niche.competition_level} competition
                  </Badge>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs text-gray-600">Market Size</p>
                      <p className="text-sm font-semibold text-gray-900">{niche.market_size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Entry Cost</p>
                      <p className="text-sm font-semibold text-gray-900">{niche.entry_cost}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-violet-600" />
                    <div>
                      <p className="text-xs text-gray-600">Best For</p>
                      <p className="text-sm font-semibold text-gray-900">{niche.best_for}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="text-xs text-gray-600">12M Forecast</p>
                      <p className="text-sm font-semibold text-gray-900">{niche.growth_forecast}</p>
                    </div>
                  </div>
                </div>

                {/* Growth Indicators */}
                {niche.growth_indicators && niche.growth_indicators.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Growth Indicators:</p>
                    <div className="flex flex-wrap gap-2">
                      {niche.growth_indicators.map((indicator, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {indicator}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Revenue Models */}
                {niche.revenue_models && niche.revenue_models.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Revenue Models:</p>
                    <div className="flex flex-wrap gap-2">
                      {niche.revenue_models.map((model, idx) => (
                        <Badge key={idx} className="bg-blue-100 text-blue-700">
                          {model}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Explore This Niche
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}