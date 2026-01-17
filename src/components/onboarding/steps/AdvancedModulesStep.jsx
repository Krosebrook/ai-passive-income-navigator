import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { GraduationCap, TrendingUp, Users, FileText, Briefcase } from 'lucide-react';

const ADVANCED_MODULES = [
  {
    id: 'financial_modeling',
    title: 'Advanced Financial Modeling',
    description: 'Learn to build detailed financial models, cash flow projections, and scenario analysis',
    icon: TrendingUp,
    level: 'Advanced',
    duration: '~15 min'
  },
  {
    id: 'ma_basics',
    title: 'M&A Fundamentals',
    description: 'Understanding mergers, acquisitions, valuation methods, and deal structuring',
    icon: Briefcase,
    level: 'Advanced',
    duration: '~20 min'
  },
  {
    id: 'due_diligence',
    title: 'Comprehensive Due Diligence',
    description: 'Master the art of evaluating businesses, verifying claims, and identifying red flags',
    icon: FileText,
    level: 'Intermediate',
    duration: '~12 min'
  },
  {
    id: 'syndication',
    title: 'Investment Syndication',
    description: 'How to pool resources with other investors and manage syndicate deals',
    icon: Users,
    level: 'Advanced',
    duration: '~10 min'
  }
];

export default function AdvancedModulesStep({ preferences, updatePreferences }) {
  const toggleModule = (moduleId) => {
    const current = preferences.advanced_modules || [];
    updatePreferences({
      advanced_modules: current.includes(moduleId)
        ? current.filter(m => m !== moduleId)
        : [...current, moduleId]
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <GraduationCap className="w-6 h-6 text-violet-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 mb-1">Optional: Accelerate Your Learning</p>
            <p className="text-sm text-gray-700">
              Select advanced topics you'd like to explore. We'll add guided tutorials and 
              AI-powered coaching for these areas throughout your journey.
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        You can skip this step and explore these modules anytime from your dashboard.
      </p>

      <div className="space-y-3">
        {ADVANCED_MODULES.map((module) => {
          const Icon = module.icon;
          const isSelected = preferences.advanced_modules?.includes(module.id);

          return (
            <Card
              key={module.id}
              className={`p-4 transition-all cursor-pointer ${
                isSelected ? 'border-violet-500 bg-violet-50' : 'hover:border-gray-300'
              }`}
              onClick={() => toggleModule(module.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  isSelected ? 'bg-violet-600' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    isSelected ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{module.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {module.level}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-gray-500">
                      {module.duration}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{module.description}</p>
                </div>
                <Switch
                  checked={isSelected}
                  onCheckedChange={() => toggleModule(module.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {preferences.advanced_modules?.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✨ Great choice! We'll integrate {preferences.advanced_modules.length} advanced {
              preferences.advanced_modules.length === 1 ? 'module' : 'modules'
            } into your learning path.
          </p>
        </div>
      )}
    </div>
  );
}