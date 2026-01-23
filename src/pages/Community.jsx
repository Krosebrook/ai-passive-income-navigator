import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui/PageHeader';
import SharedWatchlistManager from '@/components/community/SharedWatchlistManager';
import InvestmentGroupsHub from '@/components/community/InvestmentGroupsHub';
import ExpertContentHub from '@/components/community/ExpertContentHub';
import { Users, Bookmark, BookOpen, MessageSquare } from 'lucide-react';

export default function CommunityPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Community"
          subtitle="Collaborate, learn, and grow with fellow investors"
        />

        <Tabs defaultValue="watchlists" className="mt-8">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl bg-[#1a0f2e] border border-[#2d1e50]">
            <TabsTrigger value="watchlists" className="gap-2">
              <Bookmark className="w-4 h-4" />
              Watchlists
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-2">
              <Users className="w-4 h-4" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="experts" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Expert Content
            </TabsTrigger>
            <TabsTrigger value="discussions" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Discussions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="watchlists" className="mt-6">
            <SharedWatchlistManager />
          </TabsContent>

          <TabsContent value="groups" className="mt-6">
            <InvestmentGroupsHub />
          </TabsContent>

          <TabsContent value="experts" className="mt-6">
            <ExpertContentHub />
          </TabsContent>

          <TabsContent value="discussions" className="mt-6">
            <div className="text-center py-12 text-gray-400">
              Discussion forums coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}