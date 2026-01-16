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
import { Loader2, DollarSign, TrendingUp } from 'lucide-react';

export default function PricingStrategyTool({ ideaTitle, ideaDescription, onClose, open }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [formData, setFormData] = useState({
    targetAudience: '',
    productType: 'service'
  });

  const generateStrategy = async () => {
    if (!formData.targetAudience) {
      alert('Please fill in all fields');
      return;
    }

    setIsGenerating(true);
    const response = await base44.functions.invoke('generatePricingStrategy', {
      ideaTitle,
      description: ideaDescription,
      targetAudience: formData.targetAudience,
      productType: formData.productType
    });
    setStrategy(response.data);
    setIsGenerating(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-600" />
            AI Pricing Strategy
          </DialogTitle>
        </DialogHeader>

        {!strategy ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Target Audience</label>
              <Input
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g., small business owners, students, freelancers"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Product Type</label>
              <select
                value={formData.productType}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="service">Service</option>
                <option value="digital_product">Digital Product</option>
                <option value="course">Course</option>
                <option value="saas">SaaS Tool</option>
                <option value="subscription">Subscription</option>
              </select>
            </div>

            <Button
              onClick={generateStrategy}
              disabled={isGenerating || !formData.targetAudience}
              className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Strategy...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Generate Strategy
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
            {/* Recommended Price */}
            {strategy.recommended_price && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-base">Recommended Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Base Price</p>
                    <p className="text-2xl font-bold text-amber-600">${strategy.recommended_price.base_price}</p>
                    <p className="text-xs text-gray-600">Range: ${strategy.recommended_price.price_range.min} - ${strategy.recommended_price.price_range.max}</p>
                  </div>
                  <p className="text-sm text-gray-700 italic">{strategy.recommended_price.justification}</p>
                </CardContent>
              </Card>
            )}

            {/* Pricing Tiers */}
            {strategy.pricing_tiers && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Pricing Tiers</h4>
                {strategy.pricing_tiers.map((tier, idx) => (
                  <Card key={idx} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{tier.name}</h5>
                        <p className="text-lg font-bold text-violet-600">${tier.price}</p>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{tier.target_customer}</p>
                      <div className="space-y-1 text-xs">
                        {tier.features?.map((feature, fi) => (
                          <p key={fi} className="text-gray-700">✓ {feature}</p>
                        ))}
                      </div>
                      <p className="text-xs text-emerald-600 font-medium mt-2">{tier.monthly_revenue_potential}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Revenue Projections */}
            {strategy.revenue_projections && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Revenue Projections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1 text-xs">
                    {Object.entries(strategy.revenue_projections).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key}:</span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Launch Strategy */}
            {strategy.launch_strategy && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-sm">Launch Strategy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">Intro Price: <span className="font-semibold text-gray-900">${strategy.launch_strategy.intro_price}</span></p>
                    <p className="text-gray-600">Duration: <span className="font-semibold text-gray-900">{strategy.launch_strategy.promo_duration}</span></p>
                    <p className="text-gray-600">Standard Price: <span className="font-semibold text-gray-900">${strategy.launch_strategy.standard_price}</span></p>
                    <p className="text-gray-600">Expected Impact: <span className="font-semibold text-gray-900">{strategy.launch_strategy.expected_boost}</span></p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Optimization Tips */}
            {strategy.optimization_tips && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Optimization Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {strategy.optimization_tips.map((tip, idx) => (
                      <li key={idx} className="flex gap-2 text-gray-700">
                        <span className="text-violet-600 font-bold">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={() => setStrategy(null)}
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