import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrendingUp, PieChart, RefreshCw, Plus, Link as LinkIcon } from 'lucide-react';
import PortfolioPerformanceChart from '@/components/portfolio/PortfolioPerformanceChart';
import AllocationVisualization from '@/components/portfolio/AllocationVisualization';
import InvestmentList from '@/components/portfolio/InvestmentList';
import ExternalAccountsManager from '@/components/portfolio/ExternalAccountsManager';
import RebalancingPanel from '@/components/portfolio/RebalancingPanel';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function PortfolioManagement() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: investments = [], isLoading: loadingInvestments } = useQuery({
    queryKey: ['investments'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.Investment.filter({ user_email: user.email });
    }
  });

  const { data: externalAccounts = [] } = useQuery({
    queryKey: ['external_accounts'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.ExternalAccount.filter({ user_email: user.email });
    }
  });

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      // Trigger data sync from external accounts
      await Promise.all(
        externalAccounts.map(account => 
          base44.functions.invoke('syncExternalAccount', { account_id: account.id })
        )
      );
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const totalValue = investments.reduce((sum, inv) => sum + (inv.current_value || inv.initial_investment), 0);
  const totalInvested = investments.reduce((sum, inv) => sum + inv.initial_investment, 0);
  const totalROI = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

  if (loadingInvestments) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] bg-clip-text text-transparent">
            Portfolio Management
          </h1>
          <p className="text-gray-400 mt-1">Track and optimize your investments</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleRefreshData} variant="outline" disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-dark">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-white mt-1">${totalValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#00b7eb]" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-dark">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Invested</p>
                <p className="text-2xl font-bold text-white mt-1">${totalInvested.toLocaleString()}</p>
              </div>
              <PieChart className="w-8 h-8 text-[#8b85f7]" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-dark">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Overall ROI</p>
                <p className={`text-2xl font-bold mt-1 ${totalROI >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalROI.toFixed(2)}%
                </p>
              </div>
              <TrendingUp className={`w-8 h-8 ${totalROI >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="bg-[#1a0f2e] border border-[#2d1e50]">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="accounts">External Accounts</TabsTrigger>
          <TabsTrigger value="rebalancing">Rebalancing</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <PortfolioPerformanceChart investments={investments} />
        </TabsContent>

        <TabsContent value="allocation">
          <AllocationVisualization investments={investments} />
        </TabsContent>

        <TabsContent value="investments">
          <InvestmentList investments={investments} />
        </TabsContent>

        <TabsContent value="accounts">
          <ExternalAccountsManager accounts={externalAccounts} />
        </TabsContent>

        <TabsContent value="rebalancing">
          <RebalancingPanel investments={investments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}