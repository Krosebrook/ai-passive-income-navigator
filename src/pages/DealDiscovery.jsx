import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import DealSourcingCriteriaManager from '@/components/deals/DealSourcingCriteriaManager';
import SourcedOpportunitiesList from '@/components/deals/SourcedOpportunitiesList';

export default function DealDiscoveryPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [currentCriteriaId, setCurrentCriteriaId] = useState(null);

  const handleSourceDeals = async (criteriaId) => {
    setIsSearching(true);
    setCurrentCriteriaId(criteriaId);
    
    try {
      const response = await base44.functions.invoke('sourceDealOpportunities', {
        criteriaId
      });

      toast.success(`Found ${response.data.opportunities_found} opportunities!`);
    } catch (error) {
      console.error('Failed to source deals:', error);
      toast.error('Failed to source deals');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-violet-500" />
            AI Deal Discovery
          </h1>
          <p className="text-gray-400">
            Let AI scan online marketplaces and find passive income opportunities matching your criteria
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <DealSourcingCriteriaManager onSourceDeals={handleSourceDeals} />
          </div>

          <div className="lg:col-span-2">
            <SourcedOpportunitiesList 
              criteriaId={currentCriteriaId}
              isSearching={isSearching}
            />
          </div>
        </div>
      </div>
    </div>
  );
}