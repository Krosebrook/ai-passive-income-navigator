import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { HelpCircle } from 'lucide-react';

const NETWORKING_OPTIONS = [
  { value: 'networking_focused', label: 'Networking Focused', desc: 'Find partners & collaborators', icon: '🤝' },
  { value: 'balanced', label: 'Balanced', desc: 'Mix of networking & learning', icon: '⚖️' },
  { value: 'knowledge_focused', label: 'Knowledge Focused', desc: 'Learn from others\' experiences', icon: '📚' }
];

const GROUP_TYPES = [
  { value: 'industry_specialists', label: 'Industry Specialists' },
  { value: 'regional_investors', label: 'Regional Groups' },
  { value: 'stage_focused', label: 'By Deal Stage' },
  { value: 'skill_level', label: 'By Skill Level' },
  { value: 'deal_sourcing', label: 'Deal Sourcing Circles' },
  { value: 'strategy_discussion', label: 'Strategy Discussions' }
];

const NOTIFICATION_OPTIONS = [
  { value: 'real_time', label: 'Real-time (instant notifications)' },
  { value: 'daily', label: 'Daily digest' },
  { value: 'weekly', label: 'Weekly digest' },
  { value: 'monthly', label: 'Monthly summary' }
];

const VISIBILITY_OPTIONS = [
  { value: 'private', label: '🔒 Private', desc: 'Only you' },
  { value: 'network_only', label: '🔐 Network Only', desc: 'Mutual follows' },
  { value: 'public', label: '🌐 Public', desc: 'Everyone' }
];

export default function ComprehensiveCommunityStep({ preferences, updatePreferences, onNext }) {
  const toggleGroup = (value) => {
    const updated = preferences.peer_group_interests?.includes(value)
      ? preferences.peer_group_interests.filter(g => g !== value)
      : [...(preferences.peer_group_interests || []), value];
    updatePreferences({ peer_group_interests: updated });
  };

  return (
    <div className="space-y-6">
      {/* Networking vs Knowledge */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-lg font-semibold text-gray-900">Community Priority</label>
          <Tooltip text="Best portfolio builders balance both" />
        </div>
        <p className="text-sm text-gray-600 mb-3">What matters most in our community?</p>
        <div className="grid gap-3">
          {NETWORKING_OPTIONS.map(option => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all border-2 ${
                preferences.networking_vs_knowledge === option.value
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updatePreferences({ networking_vs_knowledge: option.value })}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-600">{option.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Group Types */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-lg font-semibold text-gray-900">Group Types to Join</label>
          <Tooltip text="You'll be invited to matching groups automatically" />
        </div>
        <p className="text-sm text-gray-600 mb-3">Select 1-4 types that interest you</p>
        <div className="flex flex-wrap gap-2">
          {GROUP_TYPES.map(group => (
            <Badge
              key={group.value}
              variant={preferences.peer_group_interests?.includes(group.value) ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-2 text-sm"
              onClick={() => toggleGroup(group.value)}
            >
              {group.label}
            </Badge>
          ))}
        </div>
        {!preferences.peer_group_interests || preferences.peer_group_interests.length === 0 && (
          <p className="text-xs text-red-600 mt-2">Select at least 1 group type</p>
        )}
      </div>

      {/* Notification Frequency */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-lg font-semibold text-gray-900">Community Update Frequency</label>
          <Tooltip text="Weekly is most popular—stays informed without overload" />
        </div>
        <div className="space-y-2">
          {NOTIFICATION_OPTIONS.map(option => (
            <Card
              key={option.value}
              className={`cursor-pointer border ${
                preferences.community_notification_frequency === option.value
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-gray-200'
              }`}
              onClick={() => updatePreferences({ community_notification_frequency: option.value })}
            >
              <CardContent className="p-3">
                <p className="text-sm font-medium text-gray-900">{option.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Profile Visibility */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-lg font-semibold text-gray-900">Profile Visibility</label>
          <Tooltip text="Start private and open up as you get comfortable" />
        </div>
        <div className="space-y-2">
          {VISIBILITY_OPTIONS.map(option => (
            <Card
              key={option.value}
              className={`cursor-pointer border ${
                preferences.profile_visibility === option.value
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-gray-200'
              }`}
              onClick={() => updatePreferences({ profile_visibility: option.value })}
            >
              <CardContent className="p-3">
                <p className="text-sm font-medium text-gray-900">{option.label}</p>
                <p className="text-xs text-gray-600">{option.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Collaboration Requests */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="font-semibold text-gray-900 block mb-1">
              Allow Collaboration Requests
            </label>
            <p className="text-xs text-gray-600">
              Let investors reach out about partnering opportunities
            </p>
          </div>
          <Switch
            checked={preferences.allow_collaboration_requests !== false}
            onCheckedChange={(checked) => updatePreferences({ allow_collaboration_requests: checked })}
          />
        </div>
      </div>

      <Button onClick={onNext} className="w-full mt-6">
        Continue to Advanced Learning
      </Button>
    </div>
  );
}

function Tooltip({ text }) {
  return (
    <div className="relative group">
      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {text}
      </div>
    </div>
  );
}