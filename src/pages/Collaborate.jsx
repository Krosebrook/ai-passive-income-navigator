import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvestmentGroups from '@/components/collaboration/InvestmentGroups';
import SharedWatchlists from '@/components/collaboration/SharedWatchlists';
import { Users, Bookmark, Share2 } from 'lucide-react';

export default function CollaboratePage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Collaboration Hub</h1>
          <p className="text-gray-400">
            Connect with other investors, share insights, and collaborate on deals
          </p>
        </div>

        <Tabs defaultValue="groups" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Investment Groups
            </TabsTrigger>
            <TabsTrigger value="watchlists" className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              Shared Watchlists
            </TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="mt-6">
            <InvestmentGroups />
          </TabsContent>

          <TabsContent value="watchlists" className="mt-6">
            <SharedWatchlists />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}