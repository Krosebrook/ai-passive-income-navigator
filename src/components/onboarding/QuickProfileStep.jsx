import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Shield, ArrowRight } from 'lucide-react';

const TIME_OPTIONS = [
  { value: 0, label: '< 1 hour/week', desc: 'Very passive' },
  { value: 1, label: '1-2 hours/week', desc: 'Light monitoring' },
  { value: 2, label: '3-5 hours/week', desc: 'Active management' },
  { value: 3, label: '6-10 hours/week', desc: 'Hands-on operator' },
  { value: 4, label: '10+ hours/week', desc: 'Full-time builder' }
];

const RISK_OPTIONS = [
  { value: 'very_conservative', label: 'Very Conservative', desc: 'Proven models only', emoji: '🛡️' },
  { value: 'conservative', label: 'Conservative', desc: 'Low-risk, stable returns', emoji: '📊' },
  { value: 'moderate', label: 'Moderate', desc: 'Balanced risk/reward', emoji: '⚖️' },
  { value: 'aggressive', label: 'Aggressive', desc: 'High growth potential', emoji: '🚀' },
  { value: 'very_aggressive', label: 'Very Aggressive', desc: 'Emerging opportunities', emoji: '💎' }
];

export default function QuickProfileStep({ onComplete, initialData = {} }) {
  const [time, setTime] = useState(initialData.time_commitment ?? null);
  const [risk, setRisk] = useState(initialData.risk_tolerance ?? null);

  const canContinue = time !== null && risk !== null;

  const handleContinue = () => {
    if (canContinue) {
      onComplete({ time_commitment: time, risk_tolerance: risk });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Two quick questions</h3>
        <p className="text-[#a0aec0]">This helps us match you with the right opportunities</p>
      </div>

      {/* Time Commitment */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-[#8b85f7]" />
          <h4 className="text-lg font-semibold">How much time can you commit weekly?</h4>
        </div>
        <div className="space-y-2">
          {TIME_OPTIONS.map((option, i) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={`cursor-pointer border-2 transition-all ${
                  time === option.value
                    ? 'border-[#8b85f7] bg-[#8b85f7]/10'
                    : 'border-[#2d1e50] hover:border-[#8b85f7]/50'
                }`}
                onClick={() => setTime(option.value)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{option.label}</p>
                    <p className="text-sm text-[#a0aec0]">{option.desc}</p>
                  </div>
                  {time === option.value && (
                    <div className="w-6 h-6 rounded-full bg-[#8b85f7] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Risk Tolerance */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-[#00b7eb]" />
          <h4 className="text-lg font-semibold">What's your risk comfort level?</h4>
        </div>
        <div className="space-y-2">
          {RISK_OPTIONS.map((option, i) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={`cursor-pointer border-2 transition-all ${
                  risk === option.value
                    ? 'border-[#00b7eb] bg-[#00b7eb]/10'
                    : 'border-[#2d1e50] hover:border-[#00b7eb]/50'
                }`}
                onClick={() => setRisk(option.value)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.emoji}</span>
                    <div>
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-sm text-[#a0aec0]">{option.desc}</p>
                    </div>
                  </div>
                  {risk === option.value && (
                    <div className="w-6 h-6 rounded-full bg-[#00b7eb] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Button
        className="w-full bg-gradient-to-r from-[#8b85f7] to-[#583cf0] disabled:opacity-50"
        onClick={handleContinue}
        disabled={!canContinue}
      >
        Continue
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      {canContinue && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-center text-[#a0aec0]"
        >
          ✓ We'll use these to source deals matching your criteria
        </motion.p>
      )}
    </div>
  );
}