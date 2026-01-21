import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Zap, Target, TrendingUp, Users } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function QuickStartStep({ preferences, onComplete, onBack, canGoBack }) {
  const quickStartActions = [
    {
      icon: Zap,
      title: 'Explore AI-Sourced Deals',
      description: 'Browse deals matched to your preferences',
      action: 'View Deals',
      link: 'Home',
      color: 'from-[#8b85f7] to-[#583cf0]'
    },
    {
      icon: Target,
      title: 'Set Up Your Pipeline',
      description: 'Organize and track potential investments',
      action: 'Open Pipeline',
      link: 'DealPipeline',
      color: 'from-[#00b7eb] to-[#0095c7]'
    },
    {
      icon: TrendingUp,
      title: 'Review Analytics',
      description: 'Get insights into market trends',
      action: 'View Analytics',
      link: 'Analytics',
      color: 'from-[#ff8e42] to-[#f0ab65]'
    },
    {
      icon: Users,
      title: 'Join Community',
      description: 'Connect with other investors',
      action: 'Explore Community',
      link: 'Community',
      color: 'from-[#ff69b4] to-[#ff1493]'
    }
  ];

  // Prioritize actions based on risk tolerance
  const prioritizedActions = preferences?.risk_tolerance === 'conservative' || preferences?.risk_tolerance === 'very_conservative'
    ? [quickStartActions[1], quickStartActions[2], quickStartActions[0], quickStartActions[3]]
    : quickStartActions;

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <Zap className="w-12 h-12 text-[#ff8e42] mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Quick Start Guide
        </h2>
        <p className="text-gray-400">
          Choose where you'd like to begin your journey
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {prioritizedActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card
              key={index}
              className="card-dark hover:border-[#8b85f7] transition-all cursor-pointer group"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0 glow-primary`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-400">{action.description}</p>
                  </div>
                  <Link to={createPageUrl(action.link)}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="group-hover:bg-[#8b85f7] group-hover:text-white transition-all"
                      onClick={() => onComplete({ selected_action: action.link })}
                    >
                      {action.action}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3">
        {canGoBack && (
          <Button onClick={onBack} variant="outline" className="flex-1">
            Back
          </Button>
        )}
        <Button onClick={() => onComplete({})} className="flex-1 btn-primary">
          Finish Setup
        </Button>
      </div>
    </div>
  );
}