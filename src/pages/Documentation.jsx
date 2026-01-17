import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/ui/PageHeader';
import AIFeaturesGuide from '@/components/docs/AIFeaturesGuide';
import OnboardingFlowGuide from '@/components/docs/OnboardingFlowGuide';
import { BookOpen, Sparkles, Map, Code } from 'lucide-react';

export default function DocumentationPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Platform Documentation"
          subtitle="Comprehensive guides for FlashFusion AI features"
        />

        <Tabs defaultValue="ai-features" className="mt-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="ai-features" className="gap-2">
              <Sparkles className="w-4 h-4" />
              AI Features
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="gap-2">
              <Map className="w-4 h-4" />
              Onboarding Flow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-features">
            <AIFeaturesGuide />
          </TabsContent>

          <TabsContent value="onboarding">
            <OnboardingFlowGuide />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}