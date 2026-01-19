import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import AIInvestmentCoach from '@/components/ai/AIInvestmentCoach';
import SourcedOpportunitiesPanel from '@/components/deals/SourcedOpportunitiesPanel';
import AIGeneratedDeals from '@/components/deals/AIGeneratedDeals';
import AIAssistantChat from '@/components/ai/AIAssistantChat';
import AIInvestmentAdvisor from '@/components/ai/AIInvestmentAdvisor';
import { Sparkles, TrendingUp, Zap, MessageSquare, Brain } from 'lucide-react';

export default function AICoachPage() {
    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <PageHeader
                    title="AI-Powered Intelligence"
                    subtitle="AI coach guidance and automated deal sourcing"
                />

                <Tabs defaultValue="ai-deals" className="mt-8">
                    <TabsList className="grid w-full grid-cols-5 max-w-4xl">
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

                    <TabsContent value="ai-deals" className="mt-6">
                        <AIGeneratedDeals />
                    </TabsContent>

                    <TabsContent value="advisor" className="mt-6">
                        <AIInvestmentAdvisor />
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