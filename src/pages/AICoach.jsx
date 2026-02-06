import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import AIInvestmentCoach from '@/components/ai/AIInvestmentCoach';
import SourcedOpportunitiesPanel from '@/components/deals/SourcedOpportunitiesPanel';
import AIGeneratedDeals from '@/components/deals/AIGeneratedDeals';
import AIAssistantChat from '@/components/ai/AIAssistantChat';
import EnhancedAIAdvisor from '@/components/ai/EnhancedAIAdvisor';
import NewDealsFeed from '@/components/deals/NewDealsFeed';
import MarketDataFeed from '@/components/market/MarketDataFeed';
import MarketAlertManager from '@/components/market/MarketAlertManager';
import MarketIntelligencePanel from '@/components/ai/MarketIntelligencePanel';
import DealPerformanceCorrelation from '@/components/ai/DealPerformanceCorrelation';
import EmergingOpportunitiesPanel from '@/components/trends/EmergingOpportunitiesPanel';
import AIOriginatedDeals from '@/components/deals/AIOriginatedDeals';
import AutoDiscoveredDeals from '@/components/deals/AutoDiscoveredDeals';
import { Sparkles, TrendingUp, Zap, MessageSquare, Brain, Rss, BarChart3, Activity, LineChart, Rocket, Lightbulb, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AICoachPage() {
    const [userPreferences, setUserPreferences] = useState(null);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const user = await base44.auth.me();
                const prefs = await base44.entities.UserPreferences.filter({ 
                    created_by: user.email 
                });
                if (prefs.length > 0) {
                    setUserPreferences(prefs[0]);
                }
            } catch (error) {
                console.error('Failed to fetch preferences:', error);
            }
        };
        fetchPreferences();
    }, []);

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <PageHeader
                    title="AI-Powered Intelligence"
                    subtitle="Real-time market data, sentiment analysis, and deal performance insights"
                />

                <Tabs defaultValue="discover" className="mt-8">
                    <TabsList className="grid w-full grid-cols-12 max-w-full overflow-x-auto">
                        <TabsTrigger value="discover" className="gap-2">
                            <Search className="w-4 h-4" />
                            Discover
                        </TabsTrigger>
                        <TabsTrigger value="originate" className="gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Originate
                        </TabsTrigger>
                        <TabsTrigger value="emerging" className="gap-2">
                            <Rocket className="w-4 h-4" />
                            Emerging
                        </TabsTrigger>
                        <TabsTrigger value="market-intel" className="gap-2">
                            <Activity className="w-4 h-4" />
                            Market Intel
                        </TabsTrigger>
                        <TabsTrigger value="correlation" className="gap-2">
                            <LineChart className="w-4 h-4" />
                            Correlation
                        </TabsTrigger>
                        <TabsTrigger value="new-deals" className="gap-2">
                            <Rss className="w-4 h-4" />
                            New Deals
                        </TabsTrigger>
                        <TabsTrigger value="market" className="gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Market
                        </TabsTrigger>
                        <TabsTrigger value="ai-deals" className="gap-2">
                            <Zap className="w-4 h-4" />
                            AI Deals
                        </TabsTrigger>
                        <TabsTrigger value="advisor" className="gap-2">
                            <Brain className="w-4 h-4" />
                            Advisor
                        </TabsTrigger>
                        <TabsTrigger value="coach" className="gap-2">
                            <Sparkles className="w-4 h-4" />
                            Coach
                        </TabsTrigger>
                        <TabsTrigger value="sourcing" className="gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Sourcing
                        </TabsTrigger>
                        <TabsTrigger value="assistant" className="gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Assistant
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="discover" className="mt-6">
                        <AutoDiscoveredDeals />
                    </TabsContent>

                    <TabsContent value="originate" className="mt-6">
                        <AIOriginatedDeals />
                    </TabsContent>

                    <TabsContent value="emerging" className="mt-6">
                        <EmergingOpportunitiesPanel />
                    </TabsContent>

                    <TabsContent value="market-intel" className="mt-6">
                        <MarketIntelligencePanel userPreferences={userPreferences} />
                    </TabsContent>

                    <TabsContent value="correlation" className="mt-6">
                        <DealPerformanceCorrelation />
                    </TabsContent>

                    <TabsContent value="new-deals" className="mt-6">
                        <NewDealsFeed />
                    </TabsContent>

                    <TabsContent value="market" className="mt-6">
                        <div className="space-y-6">
                            <MarketDataFeed industries={['Technology', 'Healthcare', 'Finance', 'Real Estate']} />
                            <MarketAlertManager />
                        </div>
                    </TabsContent>

                    <TabsContent value="ai-deals" className="mt-6">
                        <AIGeneratedDeals />
                    </TabsContent>

                    <TabsContent value="advisor" className="mt-6">
                        <EnhancedAIAdvisor />
                    </TabsContent>

                    <TabsContent value="coach" className="mt-6">
                        <AIInvestmentCoach />
                    </TabsContent>

                    <TabsContent value="sourcing" className="mt-6">
                        <SourcedOpportunitiesPanel />
                    </TabsContent>

                    <TabsContent value="assistant" className="mt-6">
                        <AIAssistantChat />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}