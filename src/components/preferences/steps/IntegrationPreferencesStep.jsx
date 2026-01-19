import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Zap, Calendar, FileText, DollarSign } from 'lucide-react';
import ContextualTooltip from '@/components/guidance/ContextualTooltip';

const AVAILABLE_INTEGRATIONS = [
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    icon: Calendar,
    description: 'Sync deal milestones and reminders',
    fields: []
  },
  {
    id: 'stripe',
    name: 'Stripe',
    icon: DollarSign,
    description: 'Track revenue from your deals',
    fields: [{ key: 'account_id', label: 'Account ID', type: 'text' }]
  },
  {
    id: 'airtable',
    name: 'Airtable',
    icon: FileText,
    description: 'Export deals to Airtable base',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password' },
      { key: 'base_id', label: 'Base ID', type: 'text' }
    ]
  },
  {
    id: 'zapier',
    name: 'Zapier',
    icon: Zap,
    description: 'Connect to 5,000+ apps',
    fields: [{ key: 'webhook_url', label: 'Webhook URL', type: 'text' }]
  }
];

const NOTIFICATION_SETTINGS = [
  { key: 'new_deals', label: 'New Deal Matches', desc: 'When AI finds matching deals' },
  { key: 'portfolio_updates', label: 'Portfolio Updates', desc: 'Performance changes' },
  { key: 'reminders', label: 'Task Reminders', desc: 'Due date notifications' },
  { key: 'insights', label: 'Weekly Insights', desc: 'AI-generated reports' }
];

export default function IntegrationPreferencesStep({ onNext, initialData = {} }) {
  const [integrations, setIntegrations] = useState(initialData.enabled_integrations || []);
  const [integrationConfigs, setIntegrationConfigs] = useState(initialData.integration_configs || {});
  const [notifications, setNotifications] = useState(
    initialData.notification_settings || NOTIFICATION_SETTINGS.reduce((acc, n) => ({ ...acc, [n.key]: true }), {})
  );

  const toggleIntegration = (id) => {
    setIntegrations(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const updateIntegrationConfig = (id, field, value) => {
    setIntegrationConfigs(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleComplete = () => {
    onNext({
      enabled_integrations: integrations,
      integration_configs: integrationConfigs,
      notification_settings: notifications
    });
  };

  return (
    <div className="space-y-6">
      {/* Available Integrations */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label className="text-base">External Tools</Label>
          <ContextualTooltip
            title="Tool Integrations"
            description="Connect external services to automate tracking, sync data, and streamline workflows."
            whyItMatters="Integrations save hours of manual data entry and ensure you never miss important updates or deadlines."
          />
        </div>
        <p className="text-sm text-gray-400 mb-4">Connect your favorite tools to FlashFusion</p>
        
        <div className="space-y-3">
          {AVAILABLE_INTEGRATIONS.map(integration => {
            const Icon = integration.icon;
            const isEnabled = integrations.includes(integration.id);
            
            return (
              <div
                key={integration.id}
                className={`border-2 rounded-xl transition-all ${
                  isEnabled ? 'border-[#8b85f7] bg-[#8b85f7]/5' : 'border-[#2d1e50]'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isEnabled ? 'bg-[#8b85f7]' : 'bg-[#2d1e50]'
                      }`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{integration.name}</h4>
                        <p className="text-sm text-gray-400">{integration.description}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleIntegration(integration.id)}
                      className={`w-12 h-6 rounded-full transition-all ${
                        isEnabled ? 'bg-[#8b85f7]' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Configuration Fields */}
                  {isEnabled && integration.fields.length > 0 && (
                    <div className="mt-4 space-y-3 pl-13">
                      {integration.fields.map(field => (
                        <div key={field.key}>
                          <Label className="text-xs text-gray-400">{field.label}</Label>
                          <Input
                            type={field.type}
                            value={integrationConfigs[integration.id]?.[field.key] || ''}
                            onChange={(e) => updateIntegrationConfig(integration.id, field.key, e.target.value)}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            className="mt-1"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notification Preferences */}
      <div>
        <Label className="text-base mb-3 block">Notification Preferences</Label>
        <p className="text-sm text-gray-400 mb-4">Choose what updates you want to receive</p>
        
        <div className="space-y-3">
          {NOTIFICATION_SETTINGS.map(setting => (
            <div
              key={setting.key}
              className="flex items-center justify-between bg-[#0f0618] rounded-xl p-4 border border-[#2d1e50]"
            >
              <div>
                <Label className="text-sm">{setting.label}</Label>
                <p className="text-xs text-gray-400 mt-1">{setting.desc}</p>
              </div>
              <button
                onClick={() => toggleNotification(setting.key)}
                className={`w-12 h-6 rounded-full transition-all ${
                  notifications[setting.key] ? 'bg-[#8b85f7]' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  notifications[setting.key] ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={handleComplete}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
      >
        <CheckCircle2 className="w-5 h-5 mr-2" />
        Complete Setup
      </Button>

      <p className="text-xs text-center text-gray-500">
        You can always update these preferences later from your profile settings
      </p>
    </div>
  );
}