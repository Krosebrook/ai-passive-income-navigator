import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import AIInvestmentCoach from '@/components/ai/AIInvestmentCoach';
import SourcedOpportunitiesPanel from '@/components/deals/SourcedOpportunitiesPanel';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function AICoachPage() {
    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <PageHeader
                    title="AI-Powered Intelligence"
                    subtitle="AI coach guidance and automated deal sourcing"
                />

                <Tabs defaultValue="coach" className="mt-8">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                        <TabsTrigger value="coach" className="gap-2">
                            <Sparkles className="w-4 h-4" />
                            Investment Coach
                        </TabsTrigger>
                        <TabsTrigger value="sourcing" className="gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Deal Sourcing
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="coach" className="mt-6">
                        <AIInvestmentCoach />
                    </TabsContent>

                    <TabsContent value="sourcing" className="mt-6">
                        <SourcedOpportunitiesPanel />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}