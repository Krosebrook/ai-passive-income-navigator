import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Users, Bell, Eye, UserPlus } from 'lucide-react';

const PEER_GROUPS = [
  'First-time Investors', 'E-commerce Operators', 'SaaS Founders',
  'Real Estate Investors', 'Content Creators', 'Digital Nomads',
  'Serial Entrepreneurs', 'Passive Income Veterans'
];

export default function CommunityPreferencesStep({ preferences, updatePreferences }) {
  const toggleGroup = (group) => {
    const current = preferences.peer_group_interests || [];
    updatePreferences({
      peer_group_interests: current.includes(group)
        ? current.filter(g => g !== group)
        : [...current, group]
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-900">
          <strong>Why join the community?</strong> Connect with investors, share insights, 
          discover co-investment opportunities, and learn from others' experiences.
        </p>
      </div>

      {/* Peer Groups */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Types of Peer Groups I'm Interested In
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Select groups you'd like to connect with
        </p>
        <div className="flex flex-wrap gap-2">
          {PEER_GROUPS.map((group) => (
            <Badge
              key={group}
              onClick={() => toggleGroup(group)}
              className={`cursor-pointer ${
                preferences.peer_group_interests?.includes(group)
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {group}
            </Badge>
          ))}
        </div>
      </div>

      {/* Networking vs Knowledge */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          My Community Focus
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'networking_focused', label: 'Networking', desc: 'Build relationships' },
            { value: 'balanced', label: 'Balanced', desc: 'Mix of both' },
            { value: 'knowledge_focused', label: 'Learning', desc: 'Gain knowledge' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updatePreferences({ networking_vs_knowledge: option.value })}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                preferences.networking_vs_knowledge === option.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900">{option.label}</div>
              <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Notification Frequency */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Community Notification Frequency
        </label>
        <Select
          value={preferences.community_notification_frequency}
          onValueChange={(value) => updatePreferences({ community_notification_frequency: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="real_time">Real-time - As things happen</SelectItem>
            <SelectItem value="daily">Daily Digest</SelectItem>
            <SelectItem value="weekly">Weekly Summary</SelectItem>
            <SelectItem value="monthly">Monthly Roundup</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Privacy & Sharing Settings
        </h4>

        <div>
          <label className="text-sm font-medium text-gray-900 mb-2 block">
            Profile Visibility
          </label>
          <Select
            value={preferences.profile_visibility}
            onValueChange={(value) => updatePreferences({ profile_visibility: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public - Anyone can see my profile</SelectItem>
              <SelectItem value="network_only">Network Only - Only my connections</SelectItem>
              <SelectItem value="private">Private - Hidden from search</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Allow Collaboration Requests
              </p>
              <p className="text-xs text-gray-600">
                Let others invite you to investment groups and deals
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.allow_collaboration_requests}
            onCheckedChange={(checked) => updatePreferences({ allow_collaboration_requests: checked })}
          />
        </div>
      </div>
    </div>
  );
}