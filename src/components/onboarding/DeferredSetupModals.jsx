import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2 } from 'lucide-react';

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Real Estate', 'E-commerce',
  'Manufacturing', 'Energy', 'Education', 'Entertainment', 'Other'
];

const DEAL_STRUCTURES = [
  { value: 'equity', label: 'Equity Investment' },
  { value: 'revenue_share', label: 'Revenue Share' },
  { value: 'licensing', label: 'Licensing' },
  { value: 'royalty', label: 'Royalty Agreement' },
  { value: 'partnership', label: 'Strategic Partnership' }
];

const GEOGRAPHIC_REGIONS = [
  'North America', 'Europe', 'Asia Pacific', 'Latin America', 
  'Middle East', 'Africa', 'Global'
];

export function IndustryPreferencesModal({ open, onClose, onComplete, initialData = [] }) {
  const [selected, setSelected] = useState(initialData);

  const toggleIndustry = (industry) => {
    setSelected(prev => 
      prev.includes(industry) 
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  const handleComplete = () => {
    onComplete({ target_industries: selected });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#1a0f2e] border-[#2d1e50]">
        <DialogHeader>
          <DialogTitle>Select Your Target Industries</DialogTitle>
          <DialogDescription>
            Choose industries you're interested in. We'll prioritize deals in these sectors.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {INDUSTRIES.map(industry => (
              <button
                key={industry}
                onClick={() => toggleIndustry(industry)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selected.includes(industry)
                    ? 'border-[#8b85f7] bg-[#8b85f7]/10'
                    : 'border-[#2d1e50] hover:border-[#8b85f7]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{industry}</span>
                  {selected.includes(industry) && (
                    <CheckCircle2 className="w-5 h-5 text-[#8b85f7]" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Skip for Now</Button>
            <Button 
              onClick={handleComplete}
              disabled={selected.length === 0}
              className="bg-[#8b85f7] hover:bg-[#7a75e8]"
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DealStructuresModal({ open, onClose, onComplete, initialData = [] }) {
  const [selected, setSelected] = useState(initialData);

  const toggleStructure = (structure) => {
    setSelected(prev => 
      prev.includes(structure) 
        ? prev.filter(s => s !== structure)
        : [...prev, structure]
    );
  };

  const handleComplete = () => {
    onComplete({ preferred_deal_structures: selected });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#1a0f2e] border-[#2d1e50]">
        <DialogHeader>
          <DialogTitle>Preferred Deal Structures</DialogTitle>
          <DialogDescription>
            Select the types of deals you're most interested in.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {DEAL_STRUCTURES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => toggleStructure(value)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selected.includes(value)
                  ? 'border-[#8b85f7] bg-[#8b85f7]/10'
                  : 'border-[#2d1e50] hover:border-[#8b85f7]/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{label}</span>
                {selected.includes(value) && (
                  <CheckCircle2 className="w-5 h-5 text-[#8b85f7]" />
                )}
              </div>
            </button>
          ))}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Skip for Now</Button>
            <Button 
              onClick={handleComplete}
              disabled={selected.length === 0}
              className="bg-[#8b85f7] hover:bg-[#7a75e8]"
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GeographicPreferencesModal({ open, onClose, onComplete, initialData = [] }) {
  const [selected, setSelected] = useState(initialData);

  const toggleRegion = (region) => {
    setSelected(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const handleComplete = () => {
    onComplete({ geo_preferences: selected });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#1a0f2e] border-[#2d1e50]">
        <DialogHeader>
          <DialogTitle>Geographic Focus</DialogTitle>
          <DialogDescription>
            Choose regions where you want to discover opportunities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {GEOGRAPHIC_REGIONS.map(region => (
            <button
              key={region}
              onClick={() => toggleRegion(region)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selected.includes(region)
                  ? 'border-[#8b85f7] bg-[#8b85f7]/10'
                  : 'border-[#2d1e50] hover:border-[#8b85f7]/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{region}</span>
                {selected.includes(region) && (
                  <CheckCircle2 className="w-5 h-5 text-[#8b85f7]" />
                )}
              </div>
            </button>
          ))}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Skip for Now</Button>
            <Button 
              onClick={handleComplete}
              disabled={selected.length === 0}
              className="bg-[#8b85f7] hover:bg-[#7a75e8]"
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function NotificationPreferencesModal({ open, onClose, onComplete, initialData = {} }) {
  const [frequency, setFrequency] = useState(initialData.community_notification_frequency || 'weekly');

  const handleComplete = () => {
    onComplete({ community_notification_frequency: frequency });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[#1a0f2e] border-[#2d1e50]">
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
          <DialogDescription>
            How often would you like to receive updates about new deals and opportunities?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            {[
              { value: 'real_time', label: 'Real-time', desc: 'Get notified immediately' },
              { value: 'daily', label: 'Daily Digest', desc: 'One email per day' },
              { value: 'weekly', label: 'Weekly Digest', desc: 'One email per week' },
              { value: 'monthly', label: 'Monthly Summary', desc: 'One email per month' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setFrequency(option.value)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  frequency === option.value
                    ? 'border-[#8b85f7] bg-[#8b85f7]/10'
                    : 'border-[#2d1e50] hover:border-[#8b85f7]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{option.label}</span>
                  {frequency === option.value && (
                    <CheckCircle2 className="w-5 h-5 text-[#8b85f7]" />
                  )}
                </div>
                <p className="text-xs text-[#64748b]">{option.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Skip for Now</Button>
            <Button 
              onClick={handleComplete}
              className="bg-[#8b85f7] hover:bg-[#7a75e8]"
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}