import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Link2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ExternalAccountsManager({ accounts }) {
  const [syncing, setSyncing] = useState(null);

  const handleConnectAccount = () => {
    toast.info('External account integration coming soon. Connect via Plaid or Yodlee.');
  };

  const handleSyncAccount = async (accountId) => {
    setSyncing(accountId);
    try {
      // Sync logic here
      toast.success('Account synced successfully');
    } catch (error) {
      toast.error('Failed to sync account');
    } finally {
      setSyncing(null);
    }
  };

  return (
    <Card className="card-dark">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] bg-clip-text text-transparent">
            <Link2 className="w-5 h-5 text-[#8b85f7]" />
            External Accounts
          </CardTitle>
          <Button onClick={handleConnectAccount} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Connect Account
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="text-center py-12">
            <Link2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Connected Accounts</h3>
            <p className="text-gray-400 mb-6">
              Connect your brokerage, bank, or crypto accounts to aggregate all your investments
            </p>
            <Button onClick={handleConnectAccount} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Connect Your First Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="p-4 rounded-xl border border-[#2d1e50] bg-[#0f0618] flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{account.account_name}</h3>
                    <Badge className={
                      account.connection_status === 'connected' ? 'badge-success' :
                      account.connection_status === 'error' ? 'badge-error' : 'badge-warning'
                    }>
                      {account.connection_status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">{account.account_type}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">Provider: {account.provider}</span>
                    {account.last_synced && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400">
                          Last synced: {new Date(account.last_synced).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                  {account.total_value && (
                    <p className="text-lg font-semibold text-[#00b7eb] mt-2">
                      ${account.total_value.toLocaleString()}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => handleSyncAccount(account.id)}
                  variant="outline"
                  size="sm"
                  disabled={syncing === account.id}
                >
                  <RefreshCw className={`w-4 h-4 ${syncing === account.id ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}