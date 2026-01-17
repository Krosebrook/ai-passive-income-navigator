import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
    Sparkles, TrendingUp, AlertCircle, CheckCircle2, 
    ExternalLink, Loader2, RefreshCw, Star 
} from 'lucide-react';
import { toast } from 'sonner';

export default function SourcedOpportunitiesPanel() {
    const queryClient = useQueryClient();
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [filterStatus, setFilterStatus] = useState('new');

    // Fetch sourced deals
    const { data: deals = [], isLoading } = useQuery({
        queryKey: ['sourced-deals'],
        queryFn: async () => {
            const results = await base44.entities.SourcedDealOpportunity.filter({ status: filterStatus });
            return results.sort((a, b) => (b.ai_match_score || 0) - (a.ai_match_score || 0));
        }
    });

    // Source new deals mutation
    const sourceDealsMutation = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('sourceDealOpportunitiesExternal', {});
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['sourced-deals'] });
            toast.success(`Found ${data.deals_found} new opportunities!`);
        },
        onError: () => {
            toast.error('Failed to source deals. Please check your criteria.');
        }
    });

    // Update deal status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ dealId, status }) => 
            base44.entities.SourcedDealOpportunity.update(dealId, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sourced-deals'] });
            setSelectedDeal(null);
        }
    });

    const moveToPortfolio = async (deal) => {
        // Create a new portfolio idea from the sourced deal
        const created = await base44.entities.PortfolioIdea.create({
            title: deal.deal_title,
            description: deal.deal_description,
            category: deal.industry,
            initial_investment: deal.estimated_investment,
            estimated_monthly_income: deal.monthly_revenue,
            risk_level: deal.risk_level,
            time_to_profit_months: Math.ceil(deal.estimated_investment / (deal.monthly_revenue || 1)),
            sourced_from: deal.source_url,
            status: 'idea'
        });

        await updateStatusMutation.mutateAsync({ 
            dealId: deal.id, 
            status: 'interested' 
        });

        toast.success('Added to portfolio ideas');
    };

    const getRiskColor = (risk) => {
        switch(risk?.toLowerCase()) {
            case 'low': return 'bg-emerald-100 text-emerald-800';
            case 'medium': return 'bg-amber-100 text-amber-800';
            case 'high': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-emerald-50 border-emerald-300';
        if (score >= 60) return 'bg-blue-50 border-blue-300';
        if (score >= 40) return 'bg-amber-50 border-amber-300';
        return 'bg-gray-50 border-gray-300';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-violet-600" />
                        AI-Sourced Opportunities
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Automatically discovered deals matched to your criteria
                    </p>
                </div>
                <Button
                    onClick={() => sourceDealsMutation.mutate()}
                    disabled={sourceDealsMutation.isPending}
                    className="gap-2"
                >
                    {sourceDealsMutation.isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sourcing...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-4 h-4" />
                            Source New Deals
                        </>
                    )}
                </Button>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
                {['new', 'reviewed', 'interested', 'dismissed'].map(status => (
                    <Badge
                        key={status}
                        variant={filterStatus === status ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setFilterStatus(status)}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                ))}
            </div>

            {/* Deals Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                </div>
            ) : deals.length === 0 ? (
                <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
                    <CardContent className="py-12 text-center">
                        <Sparkles className="w-12 h-12 text-violet-300 mx-auto mb-3" />
                        <p className="text-gray-600">
                            No {filterStatus} opportunities yet. Click "Source New Deals" to discover matches!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deals.map(deal => (
                        <Card
                            key={deal.id}
                            className={`cursor-pointer border-2 hover:shadow-lg transition-all ${getScoreBg(deal.ai_match_score || 0)}`}
                            onClick={() => setSelectedDeal(deal)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <CardTitle className="text-base line-clamp-2">
                                            {deal.deal_title}
                                        </CardTitle>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {deal.source_platform}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-violet-600">
                                            {deal.ai_match_score || 0}
                                        </div>
                                        <p className="text-xs text-gray-600">Match</p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {/* Key Metrics */}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="p-2 bg-white rounded border">
                                        <p className="text-gray-600">Investment</p>
                                        <p className="font-semibold">
                                            ${(deal.estimated_investment || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-white rounded border">
                                        <p className="text-gray-600">Est. ROI</p>
                                        <p className="font-semibold text-emerald-600">
                                            {deal.estimated_roi || 0}%
                                        </p>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1">
                                    <Badge variant="outline" className="text-xs">
                                        {deal.industry}
                                    </Badge>
                                    <Badge className={`text-xs ${getRiskColor(deal.risk_level)}`}>
                                        {deal.risk_level}
                                    </Badge>
                                </div>

                                {/* Highlights Preview */}
                                {deal.key_highlights && deal.key_highlights[0] && (
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                        ✓ {deal.key_highlights[0]}
                                    </p>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDeal(deal);
                                        }}
                                    >
                                        View Details
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="flex-1 gap-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            moveToPortfolio(deal);
                                        }}
                                    >
                                        <Star className="w-3 h-3" />
                                        Interested
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Deal Details Modal */}
            {selectedDeal && (
                <DealDetailModal
                    deal={selectedDeal}
                    onClose={() => setSelectedDeal(null)}
                    onInterested={() => moveToPortfolio(selectedDeal)}
                    onDismiss={() => {
                        updateStatusMutation.mutate({ 
                            dealId: selectedDeal.id, 
                            status: 'dismissed' 
                        });
                    }}
                />
            )}
        </div>
    );
}

function DealDetailModal({ deal, onClose, onInterested, onDismiss }) {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between gap-4">
                        <span>{deal.deal_title}</span>
                        <Badge className="bg-violet-600">
                            {deal.ai_match_score}% Match
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                        <Card>
                            <CardContent className="pt-4">
                                <p className="text-sm text-gray-600 mb-1">Investment</p>
                                <p className="text-lg font-bold">
                                    ${(deal.estimated_investment || 0).toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <p className="text-sm text-gray-600 mb-1">Annual ROI</p>
                                <p className="text-lg font-bold text-emerald-600">
                                    {deal.estimated_roi || 0}%
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                                <p className="text-lg font-bold">
                                    ${(deal.monthly_revenue || 0).toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Description */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2">About This Deal</h4>
                        <p className="text-sm text-gray-700">{deal.deal_description}</p>
                    </div>

                    {/* Key Highlights */}
                    {deal.key_highlights && deal.key_highlights.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Highlights
                            </h4>
                            <ul className="space-y-1">
                                {deal.key_highlights.map((highlight, i) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-emerald-600 mt-1">✓</span>
                                        {highlight}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Concerns */}
                    {deal.potential_concerns && deal.potential_concerns.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                Potential Concerns
                            </h4>
                            <ul className="space-y-1">
                                {deal.potential_concerns.map((concern, i) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-amber-600 mt-1">⚠</span>
                                        {concern}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Source */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Source</p>
                        <a
                            href={deal.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-violet-600 hover:underline flex items-center gap-2"
                        >
                            {deal.source_platform}
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button onClick={onDismiss} variant="outline" className="flex-1">
                            Dismiss
                        </Button>
                        <Button onClick={onInterested} className="flex-1 gap-2">
                            <Star className="w-4 h-4" />
                            Add to Portfolio
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}