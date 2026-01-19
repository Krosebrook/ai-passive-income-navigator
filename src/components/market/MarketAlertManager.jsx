import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Bell, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MarketAlertManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [alertForm, setAlertForm] = useState({
    alert_name: '',
    industry: '',
    metric: 'price_change',
    threshold: 5,
    condition: 'changes_by',
    notification_channels: ['in_app']
  });

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['market-alerts'],
    queryFn: () => base44.entities.MarketAlert.list('-created_date')
  });

  const createAlertMutation = useMutation({
    mutationFn: (alertData) => base44.entities.MarketAlert.create(alertData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-alerts'] });
      setShowForm(false);
      setAlertForm({
        alert_name: '',
        industry: '',
        metric: 'price_change',
        threshold: 5,
        condition: 'changes_by',
        notification_channels: ['in_app']
      });
      toast.success('Alert created');
    }
  });

  const toggleAlertMutation = useMutation({
    mutationFn: ({ alertId, isActive }) => 
      base44.entities.MarketAlert.update(alertId, { is_active: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-alerts'] });
      toast.success('Alert updated');
    }
  });

  const deleteAlertMutation = useMutation({
    mutationFn: (alertId) => base44.entities.MarketAlert.delete(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-alerts'] });
      toast.success('Alert deleted');
    }
  });

  const commonIndustries = [
    'Technology', 'Healthcare', 'Finance', 'Real Estate', 'Energy',
    'Consumer Goods', 'E-commerce', 'SaaS', 'Manufacturing', 'Retail'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-[#8b85f7]" />
          <div>
            <h3 className="text-xl font-bold text-white">Market Alerts</h3>
            <p className="text-sm text-gray-400">Get notified of significant market movements</p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Alert
        </Button>
      </div>

      {showForm && (
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <CardTitle>Create Market Alert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Alert Name</Label>
              <Input
                value={alertForm.alert_name}
                onChange={(e) => setAlertForm({ ...alertForm, alert_name: e.target.value })}
                placeholder="e.g., Tech Sector Volatility"
              />
            </div>

            <div>
              <Label>Industry</Label>
              <Select
                value={alertForm.industry}
                onValueChange={(value) => setAlertForm({ ...alertForm, industry: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {commonIndustries.map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Metric</Label>
                <Select
                  value={alertForm.metric}
                  onValueChange={(value) => setAlertForm({ ...alertForm, metric: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_change">Price Change</SelectItem>
                    <SelectItem value="volume">Volume</SelectItem>
                    <SelectItem value="sentiment">Sentiment</SelectItem>
                    <SelectItem value="volatility">Volatility</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Condition</Label>
                <Select
                  value={alertForm.condition}
                  onValueChange={(value) => setAlertForm({ ...alertForm, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Above</SelectItem>
                    <SelectItem value="below">Below</SelectItem>
                    <SelectItem value="changes_by">Changes By</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Threshold</Label>
              <Input
                type="number"
                value={alertForm.threshold}
                onChange={(e) => setAlertForm({ ...alertForm, threshold: parseFloat(e.target.value) })}
                placeholder="5"
              />
              <p className="text-xs text-gray-500 mt-1">
                {alertForm.metric === 'price_change' ? 'Percentage change' : 'Threshold value'}
              </p>
            </div>

            <div>
              <Label>Notification Channels</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={alertForm.notification_channels.includes('email')}
                    onChange={(e) => {
                      const channels = e.target.checked
                        ? [...alertForm.notification_channels, 'email']
                        : alertForm.notification_channels.filter(c => c !== 'email');
                      setAlertForm({ ...alertForm, notification_channels: channels });
                    }}
                  />
                  <span className="text-sm text-gray-300">Email</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={alertForm.notification_channels.includes('in_app')}
                    onChange={(e) => {
                      const channels = e.target.checked
                        ? [...alertForm.notification_channels, 'in_app']
                        : alertForm.notification_channels.filter(c => c !== 'in_app');
                      setAlertForm({ ...alertForm, notification_channels: channels });
                    }}
                  />
                  <span className="text-sm text-gray-300">In-App</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => createAlertMutation.mutate(alertForm)}
                disabled={!alertForm.alert_name || !alertForm.industry || createAlertMutation.isPending}
                className="flex-1"
              >
                Create Alert
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#8b85f7]" />
        </div>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className="bg-[#1a0f2e] border-[#2d1e50]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white">{alert.alert_name}</h4>
                      <Badge variant="outline">{alert.industry}</Badge>
                      {!alert.is_active && (
                        <Badge className="bg-gray-500/20 text-gray-400">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      Alert when {alert.metric.replace('_', ' ')} is {alert.condition.replace('_', ' ')} {alert.threshold}
                    </p>
                    {alert.last_triggered && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last triggered: {new Date(alert.last_triggered).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={() => toggleAlertMutation.mutate({ 
                        alertId: alert.id, 
                        isActive: alert.is_active 
                      })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAlertMutation.mutate(alert.id)}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {alerts.length === 0 && !showForm && (
            <Card className="bg-[#1a0f2e] border-[#2d1e50]">
              <CardContent className="p-12 text-center">
                <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No alerts configured yet</p>
                <Button
                  onClick={() => setShowForm(true)}
                  variant="outline"
                >
                  Create Your First Alert
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}