import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  ShoppingCart, ExternalLink, DollarSign, TrendingUp, 
  Link as LinkIcon, CheckCircle, XCircle, Loader2 
} from 'lucide-react';

const PLATFORMS = [
  { id: 'gumroad', name: 'Gumroad', icon: '🛍️', color: 'pink' },
  { id: 'etsy', name: 'Etsy', icon: '🎨', color: 'orange' },
  { id: 'shopify', name: 'Shopify', icon: '🛒', color: 'green' },
  { id: 'stripe', name: 'Stripe', icon: '💳', color: 'purple' },
  { id: 'lemonsqueezy', name: 'Lemon Squeezy', icon: '🍋', color: 'yellow' },
  { id: 'patreon', name: 'Patreon', icon: '🎭', color: 'red' },
  { id: 'teachable', name: 'Teachable', icon: '📚', color: 'blue' },
  { id: 'other', name: 'Other', icon: '🔗', color: 'gray' }
];

/**
 * Monetization Integrations Component
 * Connect and manage external sales platforms
 */
export default function MonetizationIntegrations({ portfolioIdeaId }) {
  const queryClient = useQueryClient();
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [platformUrl, setPlatformUrl] = useState('');

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['integrations', portfolioIdeaId],
    queryFn: () => base44.entities.MonetizationIntegration.filter({ 
      portfolio_idea_id: portfolioIdeaId 
    })
  });

  const addIntegration = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.MonetizationIntegration.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', portfolioIdeaId] });
      toast.success('Platform connected!');
      setSetupModalOpen(false);
      setPlatformUrl('');
    }
  });

  const handleConnect = () => {
    if (!platformUrl.trim()) {
      toast.error('Please enter a platform URL');
      return;
    }

    addIntegration.mutate({
      portfolio_idea_id: portfolioIdeaId,
      platform: selectedPlatform.id,
      platform_url: platformUrl,
      connection_status: 'connected',
      total_sales: 0,
      total_revenue: 0,
      auto_sync_enabled: false
    });
  };

  const openSetup = (platform) => {
    setSelectedPlatform(platform);
    setSetupModalOpen(true);
  };

  const totalRevenue = integrations.reduce((acc, int) => acc + (int.total_revenue || 0), 0);
  const totalSales = integrations.reduce((acc, int) => acc + (int.total_sales || 0), 0);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Connected</p>
              <p className="text-2xl font-bold">{integrations.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold">{totalSales}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Integrations */}
      {integrations.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Connected Platforms</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {integrations.map((integration) => {
              const platform = PLATFORMS.find(p => p.id === integration.platform);
              return (
                <Card key={integration.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{platform?.icon}</span>
                        <div>
                          <h4 className="font-semibold">{platform?.name}</h4>
                          <Badge className={
                            integration.connection_status === 'connected' 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }>
                            {integration.connection_status === 'connected' ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {integration.connection_status}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={integration.platform_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Revenue</p>
                        <p className="font-semibold">${integration.total_revenue || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Sales</p>
                        <p className="font-semibold">{integration.total_sales || 0}</p>
                      </div>
                    </div>

                    {integration.last_sync && (
                      <p className="text-xs text-gray-500 mt-3">
                        Last synced: {new Date(integration.last_sync).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Platforms */}
      <div>
        <h3 className="font-semibold mb-3">Connect New Platform</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PLATFORMS.map((platform) => {
            const isConnected = integrations.some(i => i.platform === platform.id);
            return (
              <button
                key={platform.id}
                onClick={() => !isConnected && openSetup(platform)}
                disabled={isConnected}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  isConnected
                    ? 'border-green-200 bg-green-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-violet-400 hover:bg-violet-50'
                }`}
              >
                <span className="text-3xl block mb-2">{platform.icon}</span>
                <p className="font-medium text-sm">{platform.name}</p>
                {isConnected && (
                  <CheckCircle className="w-4 h-4 text-green-600 mx-auto mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Setup Modal */}
      <Dialog open={setupModalOpen} onOpenChange={setSetupModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Connect {selectedPlatform?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter your {selectedPlatform?.name} store URL or profile link
            </p>

            <Input
              placeholder={`e.g., https://${selectedPlatform?.id}.com/yourstore`}
              value={platformUrl}
              onChange={(e) => setPlatformUrl(e.target.value)}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                💡 <strong>Tip:</strong> You can manually update sales data or set up automatic 
                syncing with API keys in your profile settings.
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleConnect} 
                disabled={addIntegration.isPending}
                className="flex-1"
              >
                {addIntegration.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting...</>
                ) : (
                  'Connect Platform'
                )}
              </Button>
              <Button variant="outline" onClick={() => setSetupModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}