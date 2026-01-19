import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import AIInvestmentCoach from '@/components/ai/AIInvestmentCoach';
import SourcedOpportunitiesPanel from '@/components/deals/SourcedOpportunitiesPanel';
import AIGeneratedDeals from '@/components/deals/AIGeneratedDeals';
import AIAssistantChat from '@/components/ai/AIAssistantChat';
import { Sparkles, TrendingUp, Zap, MessageSquare } from 'lucide-react';

export default function AICoachPage() {
    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <PageHeader
                    title="AI-Powered Intelligence"
                    subtitle="AI coach guidance and automated deal sourcing"
                />

                <Tabs defaultValue="ai-deals" className="mt-8">
                    <TabsList className="grid w-full grid-cols-4 max-w-3xl">
                        <TabsTrigger value="ai-deals" className="gap-2">
                            <Zap className="w-4 h-4" />
                            AI Deals
                        </TabsTrigger>
                        <TabsTrigger value="coach" className="gap-2">
                            <Sparkles className="w-4 h-4" />
                            Investment Coach
                        </TabsTrigger>
                        <TabsTrigger value="sourcing" className="gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Deal Sourcing
                        </TabsTrigger>
                        <TabsTrigger value="assistant" className="gap-2">
                            <MessageSquare className="w-4 h-4" />
                            AI Assistant
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ai-deals" className="mt-6">
                        <AIGeneratedDeals />
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