import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Search, TrendingUp, MessageSquare, CheckCircle } from 'lucide-react';

const FEATURES = [
  {
    icon: Search,
    title: 'AI Deal Discovery',
    description: 'We scan 50+ deal platforms daily and match opportunities to your exact preferences with AI-powered scoring.',
    color: 'from-[#8b85f7] to-[#583cf0]'
  },
  {
    icon: Sparkles,
    title: 'Due Diligence AI',
    description: 'Get instant AI analysis on any deal: actionable steps, red flags, risk mitigation, and viability assessment.',
    color: 'from-[#00b7eb] to-[#0099cc]'
  },
  {
    icon: TrendingUp,
    title: 'Deal Pipeline',
    description: 'Track saved deals, manage tasks, set reminders, and collaborate with others on opportunities.',
    color: 'from-[#ff8e42] to-[#f0ab65]'
  },
  {
    icon: MessageSquare,
    title: 'Adaptive Learning',
    description: 'The more feedback you give, the smarter our AI gets at finding perfect matches for you.',
    color: 'from-[#ff69b4] to-[#ff1493]'
  }
];

export default function FeatureTourStep({ data, onNext, onSkip, canSkip }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Platform Features</h2>
        <p className="text-gray-400">
          Here's what makes FlashFusion powerful
        </p>
      </div>

      <div className="space-y-4">
        {FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div key={idx} className="card-dark p-4 flex gap-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 glow-primary`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-dark p-4 border-l-4 border-[#00b7eb] bg-[#00b7eb]/5">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-[#00b7eb] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Pro Tip:</p>
            <p className="text-sm text-gray-400">
              The more you interact with deals (save, dismiss, provide feedback), the better our AI gets at finding exactly what you want.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        {canSkip && (
          <Button variant="ghost" onClick={onSkip}>
            Skip tour
          </Button>
        )}
        <Button
          onClick={() => onNext({})}
          size="lg"
          className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] ml-auto"
        >
          Find My First Deal
        </Button>
      </div>
    </div>
  );
}