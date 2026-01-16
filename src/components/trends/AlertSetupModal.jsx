import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

/**
 * Alert Setup Modal
 * Allows users to configure custom alerts for trends and keywords
 */
export default function AlertSetupModal({ open, onClose, trend = null }) {
  const [alertData, setAlertData] = useState({
    trend_name: trend?.name || '',
    keywords: trend ? [trend.name] : [],
    alert_frequency: 'weekly',
    alert_channels: {
      email: true,
      in_app: true
    },
    threshold_growth_rate: 10,
    is_active: true
  });
  
  const [keywordInput, setKeywordInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !alertData.keywords.includes(trimmed)) {
      setAlertData(prev => ({
        ...prev,
        keywords: [...prev.keywords, trimmed]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setAlertData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleCreate = async () => {
    if (!alertData.trend_name.trim()) {
      toast.error('Please enter a trend name');
      return;
    }

    if (alertData.keywords.length === 0) {
      toast.error('Please add at least one keyword');
      return;
    }

    try {
      setIsCreating(true);
      await base44.entities.TrendAlert.create(alertData);
      toast.success('Alert created successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to create alert:', error);
      toast.error('Failed to create alert');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-violet-600" />
            Set Up Trend Alert
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Trend Name */}
          <div>
            <Label htmlFor="trend_name">Trend Name</Label>
            <Input
              id="trend_name"
              value={alertData.trend_name}
              onChange={(e) => setAlertData(prev => ({ ...prev, trend_name: e.target.value }))}
              placeholder="e.g., AI Content Creation"
              className="mt-1"
            />
          </div>

          {/* Keywords */}
          <div>
            <Label>Keywords to Monitor</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                placeholder="Add keyword..."
              />
              <Button onClick={addKeyword} size="icon" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {alertData.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {keyword}
                  <button onClick={() => removeKeyword(keyword)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Alert Frequency */}
          <div>
            <Label htmlFor="frequency">Alert Frequency</Label>
            <Select
              value={alertData.alert_frequency}
              onValueChange={(value) => setAlertData(prev => ({ ...prev, alert_frequency: value }))}
            >
              <SelectTrigger id="frequency" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Growth Threshold */}
          <div>
            <Label htmlFor="threshold">Growth Rate Threshold (%)</Label>
            <Input
              id="threshold"
              type="number"
              value={alertData.threshold_growth_rate}
              onChange={(e) => setAlertData(prev => ({ 
                ...prev, 
                threshold_growth_rate: parseFloat(e.target.value) 
              }))}
              placeholder="10"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get notified when growth rate exceeds this percentage
            </p>
          </div>

          {/* Alert Channels */}
          <div>
            <Label>Alert Channels</Label>
            <div className="space-y-2 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertData.alert_channels.email}
                  onChange={(e) => setAlertData(prev => ({
                    ...prev,
                    alert_channels: { ...prev.alert_channels, email: e.target.checked }
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Email notifications</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertData.alert_channels.in_app}
                  onChange={(e) => setAlertData(prev => ({
                    ...prev,
                    alert_channels: { ...prev.alert_channels, in_app: e.target.checked }
                  }))}
                  className="rounded"
                />
                <span className="text-sm">In-app notifications</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleCreate} disabled={isCreating} className="flex-1">
              {isCreating ? 'Creating...' : 'Create Alert'}
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}