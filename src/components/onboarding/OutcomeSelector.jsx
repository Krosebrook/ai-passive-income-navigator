import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, GraduationCap, Compass, ArrowRight, X } from 'lucide-react';

const OUTCOMES = [
  {
    id: 'passive_income',
    icon: DollarSign,
    label: 'Generate reliable passive income',
    description: 'Cash-flow opportunities with proven track records',
    color: 'from-emerald-500 to-green-600',
    inferred: {
      time_commitment: 2,
      risk_tolerance: 'moderate',
      time_horizon: 'medium_term',
      diversification_preference: 'moderately_diversified'
    }
  },
  {
    id: 'capital_growth',
    icon: TrendingUp,
    label: 'Grow capital long-term',
    description: 'High-growth opportunities with 3–10 year horizons',
    color: 'from-[#8b85f7] to-[#583cf0]',
    inferred: {
      time_commitment: 2,
      risk_tolerance: 'aggressive',
      time_horizon: 'long_term',
      diversification_preference: 'focused'
    }
  },
  {
    id: 'learn_deals',
    icon: GraduationCap,
    label: 'Learn how strong deals are evaluated',
    description: 'Real deals, annotated analysis—no pressure to invest',
    color: 'from-[#00b7eb] to-blue-600',
    inferred: {
      time_commitment: 3,
      risk_tolerance: 'conservative',
      time_horizon: 'medium_term',
      diversification_preference: 'highly_diversified'
    }
  },
  {
    id: 'explore_only',
    icon: Compass,
    label: 'Explore opportunities without committing',
    description: 'Low pressure. Browse, learn, decide when ready.',
    color: 'from-[#ff8e42] to-orange-600',
    inferred: {
      time_commitment: 1,
      risk_tolerance: 'conservative',
      time_horizon: 'short_term',
      diversification_preference: 'highly_diversified'
    }
  }
];

export default function OutcomeSelector({ onSelect, onSkip }) {
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSelect = (outcome) => {
    setSelectedOutcome(outcome);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    onSelect(selectedOutcome);
  };

  if (showConfirmation && selectedOutcome) {
    const outcome = OUTCOMES.find(o => o.id === selectedOutcome);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2">Perfect! Here's what we inferred:</h3>
          <p className="text-[#a0aec0]">Based on your goal, we've made some assumptions. Feel free to adjust.</p>
        </div>

        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-[#8b85f7]/30">
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-[#64748b] mb-1">Time Commitment</p>
                <p className="font-semibold">{outcome.inferred.time_commitment} hours/week</p>
              </div>
              <div>
                <p className="text-sm text-[#64748b] mb-1">Risk Tolerance</p>
                <p className="font-semibold capitalize">{outcome.inferred.risk_tolerance.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-[#64748b] mb-1">Time Horizon</p>
                <p className="font-semibold capitalize">{outcome.inferred.time_horizon.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-[#64748b] mb-1">Diversification</p>
                <p className="font-semibold capitalize">{outcome.inferred.diversification_preference.replace('_', ' ')}</p>
              </div>
            </div>

            <p className="text-sm text-[#a0aec0] bg-[#1a0f2e]/50 p-3 rounded italic">
              "{outcome.description}"
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowConfirmation(false)}
          >
            Let me adjust
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
            onClick={handleConfirm}
          >
            This is perfect
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">What's your main goal right now?</h3>
        <p className="text-[#a0aec0]">This helps us show you the most relevant opportunities first.</p>
      </div>

      <div className="space-y-3">
        {OUTCOMES.map((outcome, i) => {
          const Icon = outcome.icon;
          return (
            <motion.div
              key={outcome.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className="cursor-pointer border-2 border-[#2d1e50] hover:border-[#8b85f7] transition-all group"
                onClick={() => handleSelect(outcome.id)}
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${outcome.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{outcome.label}</h4>
                    <p className="text-sm text-[#a0aec0]">{outcome.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#64748b] group-hover:text-[#8b85f7] transition-colors" />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Button
        variant="ghost"
        className="w-full text-[#64748b] hover:text-[#a0aec0]"
        onClick={onSkip}
      >
        Skip this and continue
        <span className="text-xs ml-2">(You can update your goal later)</span>
      </Button>
    </div>
  );
}