import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ExternalLink, TrendingUp, AlertTriangle, CheckCircle, Eye, ThumbsDown, Loader2 } from 'lucide-react';

export default function SourcedOpportunitiesList({ criteriaId, isSearching }) {
  const queryClient = useQueryClient();

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['sourced-opportunities', criteriaId],
    queryFn: () => criteriaId 
      ? base44.entities.SourcedDealOpportunity.filter({ criteria_id: criteriaId }, '-created_date')
      : base44.entities.SourcedDealOpportunity.list('-created_date', 20),
    enabled: !isSearching
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.SourcedDealOpportunity.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sourced-opportunities'] });
      toast.success('Status updated');
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'reviewed': return 'bg-gray-100 text-gray-700';
      case 'interested': return 'bg-green-100 text-green-700';
      case 'dismissed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
        <p className="text-white mb-2">AI is searching online marketplaces...</p>
        <p className="text-sm text-gray-400">This may take 30-60 seconds</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-8 text-gray-400">Loading opportunities...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">
        Sourced Opportunities ({opportunities.length})
      </h3>

      {opportunities.length === 0 ? (
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardContent className="pt-6 text-center text-gray-400">
            No opportunities found yet. Create criteria and source deals to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {opportunities.map((opp) => (
            <Card key={opp.id} className="bg-[#1a0f2e] border-[#2d1e50]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-2">{opp.deal_title}</CardTitle>
                    <div className="flex gap-2 flex-wrap mb-3">
                      <Badge className={getStatusColor(opp.status)}>
                        {opp.status}
                      </Badge>
                      <Badge className={getRiskColor(opp.risk_level)}>
                        {opp.risk_level} risk
                      </Badge>
                      <Badge variant="outline" className="text-white">
                        {opp.ai_match_score}/100 match
                      </Badge>
                      {opp.source_platform && (
                        <Badge className="bg-purple-600 text-white">
                          {opp.source_platform}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-300">{opp.deal_description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Investment</span>
                    <p className="text-white font-semibold">
                      ${opp.estimated_investment?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Est. ROI</span>
                    <p className="text-emerald-400 font-semibold">
                      {opp.estimated_roi}%
                    </p>
                  </div>
                  {opp.monthly_revenue && (
                    <div>
                      <span className="text-gray-400">Monthly Revenue</span>
                      <p className="text-white font-semibold">
                        ${opp.monthly_revenue?.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">Industry</span>
                    <p className="text-white font-semibold">{opp.industry}</p>
                  </div>
                </div>

                {opp.key_highlights && opp.key_highlights.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-white mb-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Highlights
                    </h5>
                    <ul className="space-y-1">
                      {opp.key_highlights.map((highlight, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {opp.potential_concerns && opp.potential_concerns.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-white mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      Considerations
                    </h5>
                    <ul className="space-y-1">
                      {opp.potential_concerns.map((concern, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-yellow-500 mt-1">•</span>
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-gray-700">
                  {opp.source_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(opp.source_url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Listing
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: opp.id, status: 'interested' })}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Interested
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: opp.id, status: 'reviewed' })}
                    variant="outline"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Mark Reviewed
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: opp.id, status: 'dismissed' })}
                    variant="outline"
                  >
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}