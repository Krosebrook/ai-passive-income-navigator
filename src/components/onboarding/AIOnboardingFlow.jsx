import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Target, TrendingUp, Clock, DollarSign, Shield, CheckCircle, ArrowRight, Zap, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Real Estate', 'E-commerce', 'SaaS', 'Consumer Goods', 'Energy'];
const DEAL_STRUCTURES = ['Equity', 'Revenue Share', 'Licensing', 'Convertible Note', 'SAFE'];

export default function AIOnboardingFlow({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState({
    passive_income_goal: 'supplement',
    risk_tolerance: 'moderate',
    time_commitment: 2,
    target_industries: [],
    investment_size_min: 10000,
    investment_size_max: 100000,
    preferred_deal_structures: [],
    time_horizon: 'medium_term',
    existing_skills: []
  });
  const [onboardingPlan, setOnboardingPlan] = useState(null);
  const [suggestedActions, setSuggestedActions] = useState([]);
  const navigate = useNavigate();

  const generatePlanMutation = useMutation({
    mutationFn: async (prefs) => {
      const result = await base44.functions.invoke('generatePersonalizedOnboarding', { 
        preferences: prefs 
      });
      return result.data;
    },
    onSuccess: (data) => {
      setOnboardingPlan(data.onboarding_plan);
    }
  });

  const suggestActionsMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('suggestInitialActions', {});
      return result.data;
    },
    onSuccess: (data) => {
      setSuggestedActions(data.suggested_actions || []);
    }
  });

  const savePreferencesMutation = useMutation({
    mutationFn: async (prefs) => {
      const user = await base44.auth.me();
      const existing = await base44.entities.UserPreferences.filter({ user_email: user.email });
      
      if (existing.length > 0) {
        await base44.entities.UserPreferences.update(existing[0].id, {
          ...prefs,
          has_completed_onboarding: true
        });
      } else {
        await base44.entities.UserPreferences.create({
          user_email: user.email,
          ...prefs,
          has_completed_onboarding: true
        });
      }

      // Mark onboarding as complete
      await base44.entities.OnboardingState.create({
        user_email: user.email,
        completed_at: new Date().toISOString(),
        preferences_collected: true
      });

      return prefs;
    },
    onSuccess: async () => {
      await generatePlanMutation.mutateAsync(preferences);
      await suggestActionsMutation.mutateAsync();
      toast.success('Preferences saved! Generating your personalized plan...');
    }
  });

  const handleNext = async () => {
    if (step === 3) {
      await savePreferencesMutation.mutateAsync(preferences);
    }
    setStep(step + 1);
  };

  const handleComplete = () => {
    onClose();
    toast.success('Welcome to FlashFusion! Let\'s start building your portfolio.');
  };

  const handleActionClick = (action) => {
    navigate(createPageUrl(action.route || 'Home'));
    onClose();
  };

  const steps = [
    {
      title: 'Welcome to FlashFusion',
      icon: Sparkles,
      content: (
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] mx-auto flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-3">AI-Powered Investment Intelligence</h3>
            <p className="text-[#a0aec0] max-w-md mx-auto">
              Let's personalize your experience in just a few steps. Our AI will analyze your preferences 
              and create a custom investment strategy tailored to your goals.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="bg-white/5 rounded-lg p-4">
              <Target className="w-6 h-6 text-[#8b85f7] mx-auto mb-2" />
              <div className="text-xs text-[#64748b]">Set Goals</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <TrendingUp className="w-6 h-6 text-[#00b7eb] mx-auto mb-2" />
              <div className="text-xs text-[#64748b]">AI Analysis</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <Zap className="w-6 h-6 text-[#ff8e42] mx-auto mb-2" />
              <div className="text-xs text-[#64748b]">Start Investing</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Your Investment Goals',
      icon: Target,
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-3 block">What's your primary goal?</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'side_income', label: 'Side Income', desc: '$500-2k/mo' },
                { value: 'supplement', label: 'Supplement Income', desc: '$2-5k/mo' },
                { value: 'replace_job', label: 'Replace Job', desc: '$5-10k/mo' },
                { value: 'financial_freedom', label: 'Financial Freedom', desc: '$10k+/mo' }
              ].map(goal => (
                <Card 
                  key={goal.value}
                  className={`cursor-pointer transition-all ${
                    preferences.passive_income_goal === goal.value 
                      ? 'border-[#8b85f7] bg-[#8b85f7]/10' 
                      : 'border-[#2d1e50] bg-[#1a0f2e] hover:border-[#8b85f7]/50'
                  }`}
                  onClick={() => setPreferences({ ...preferences, passive_income_goal: goal.value })}
                >
                  <CardContent className="p-4">
                    <div className="font-medium text-sm">{goal.label}</div>
                    <div className="text-xs text-[#64748b] mt-1">{goal.desc}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Weekly Time Commitment: {preferences.time_commitment}h
            </Label>
            <Slider 
              value={[preferences.time_commitment]}
              onValueChange={([val]) => setPreferences({ ...preferences, time_commitment: val })}
              min={1}
              max={10}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-[#64748b]">
              <span>1h (passive)</span>
              <span>10h (active)</span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Risk Tolerance
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {['conservative', 'moderate', 'aggressive'].map(risk => (
                <Button
                  key={risk}
                  variant={preferences.risk_tolerance === risk ? 'default' : 'outline'}
                  onClick={() => setPreferences({ ...preferences, risk_tolerance: risk })}
                  className="capitalize"
                >
                  {risk}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Investment Preferences',
      icon: DollarSign,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Min Investment</Label>
              <Input 
                type="number"
                value={preferences.investment_size_min}
                onChange={(e) => setPreferences({ ...preferences, investment_size_min: parseInt(e.target.value) })}
                placeholder="10000"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Max Investment</Label>
              <Input 
                type="number"
                value={preferences.investment_size_max}
                onChange={(e) => setPreferences({ ...preferences, investment_size_max: parseInt(e.target.value) })}
                placeholder="100000"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Target Industries</Label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map(industry => (
                <Badge
                  key={industry}
                  variant={preferences.target_industries.includes(industry) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const industries = preferences.target_industries.includes(industry)
                      ? preferences.target_industries.filter(i => i !== industry)
                      : [...preferences.target_industries, industry];
                    setPreferences({ ...preferences, target_industries: industries });
                  }}
                >
                  {industry}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Preferred Deal Structures</Label>
            <div className="flex flex-wrap gap-2">
              {DEAL_STRUCTURES.map(deal => (
                <Badge
                  key={deal}
                  variant={preferences.preferred_deal_structures.includes(deal) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const deals = preferences.preferred_deal_structures.includes(deal)
                      ? preferences.preferred_deal_structures.filter(d => d !== deal)
                      : [...preferences.preferred_deal_structures, deal];
                    setPreferences({ ...preferences, preferred_deal_structures: deals });
                  }}
                >
                  {deal}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Review & Generate Plan',
      icon: CheckCircle,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#8b85f7]/10 to-[#00b7eb]/10 border border-[#8b85f7]/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#8b85f7]" />
              <span className="font-semibold">Your Profile Summary</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-[#64748b]">Goal:</span>
                <div className="font-medium capitalize">{preferences.passive_income_goal?.replace('_', ' ')}</div>
              </div>
              <div>
                <span className="text-[#64748b]">Risk:</span>
                <div className="font-medium capitalize">{preferences.risk_tolerance}</div>
              </div>
              <div>
                <span className="text-[#64748b]">Time:</span>
                <div className="font-medium">{preferences.time_commitment}h/week</div>
              </div>
              <div>
                <span className="text-[#64748b]">Budget:</span>
                <div className="font-medium">${preferences.investment_size_min.toLocaleString()} - ${preferences.investment_size_max.toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-[#64748b] text-sm">Industries:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {preferences.target_industries.map(ind => (
                  <Badge key={ind} variant="outline" className="text-xs">{ind}</Badge>
                ))}
              </div>
            </div>
          </div>

          {!onboardingPlan && (
            <div className="text-center py-8">
              <p className="text-[#a0aec0] mb-4">
                Ready to generate your personalized investment plan?
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Your Personalized Plan',
      icon: Sparkles,
      content: onboardingPlan && (
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          <div className="bg-gradient-to-r from-[#8b85f7]/10 to-[#00b7eb]/10 border border-[#8b85f7]/30 rounded-lg p-4">
            <p className="text-[#a0aec0]">{onboardingPlan.welcome_message}</p>
          </div>

          {onboardingPlan.learning_path && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#8b85f7]" />
                Your Learning Path
              </h4>
              <div className="space-y-2">
                {onboardingPlan.learning_path.slice(0, 3).map((tip, i) => (
                  <Card key={i} className="border-[#2d1e50] bg-[#1a0f2e]">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#8b85f7]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#8b85f7]">{i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{tip.title}</div>
                          <div className="text-xs text-[#64748b] mt-1">{tip.description}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {suggestedActions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#ff8e42]" />
                Quick Start Actions
              </h4>
              <div className="space-y-2">
                {suggestedActions.slice(0, 3).map((action, i) => (
                  <Card key={i} className="border-[#2d1e50] bg-[#1a0f2e] cursor-pointer hover:border-[#8b85f7]/50 transition-all"
                    onClick={() => handleActionClick(action)}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            {action.title}
                            <Badge variant="outline" className="text-xs">{action.estimated_time}</Badge>
                          </div>
                          <div className="text-xs text-[#64748b] mt-1">{action.description}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#64748b]" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#1a0f2e] border-[#2d1e50]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            {currentStep.title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep.content}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#2d1e50]">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-8 bg-[#8b85f7]' : 'w-1.5 bg-[#2d1e50]'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && step < steps.length - 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button 
                onClick={handleNext}
                disabled={savePreferencesMutation.isPending || generatePlanMutation.isPending}
                className="gap-2 bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
              >
                {step === 3 ? (
                  generatePlanMutation.isPending ? 'Generating...' : 'Generate Plan'
                ) : (
                  <>Next <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                className="gap-2 bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
              >
                Start Investing <Sparkles className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}