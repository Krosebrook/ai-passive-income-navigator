import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Sparkles, TrendingUp, AlertTriangle, CheckCircle2, 
    Target, Calendar, Loader2, RefreshCw, ArrowRight 
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIInvestmentCoach() {
    const [refreshing, setRefreshing] = useState(false);

    // Fetch investment strategy
    const { data: strategy, isLoading, refetch } = useQuery({
        queryKey: ['investment-strategy'],
        queryFn: async () => {
            const response = await base44.functions.invoke('generateInvestmentStrategy', {});
            return response.data?.strategy;
        }
    });

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
        toast.success('Strategy updated with latest analysis');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-violet-600" />
                        AI Investment Coach
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Personalized strategy & portfolio guidance</p>
                </div>
                <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    variant="outline"
                    className="gap-2"
                >
                    {refreshing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-4 h-4" />
                            Refresh Strategy
                        </>
                    )}
                </Button>
            </div>

            {strategy ? (
                <Tabs defaultValue="immediate" className="w-full">
                    <TabsList className="w-full">
                        <TabsTrigger value="immediate" className="gap-2">
                            <Target className="w-4 h-4" />
                            Next Steps
                        </TabsTrigger>
                        <TabsTrigger value="rebalancing" className="gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Rebalancing
                        </TabsTrigger>
                        <TabsTrigger value="markets" className="gap-2">
                            <ArrowRight className="w-4 h-4" />
                            Market Trends
                        </TabsTrigger>
                        <TabsTrigger value="risks" className="gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Risk Analysis
                        </TabsTrigger>
                        <TabsTrigger value="roadmap" className="gap-2">
                            <Calendar className="w-4 h-4" />
                            12-Month Plan
                        </TabsTrigger>
                    </TabsList>

                    {/* Immediate Actions */}
                    <TabsContent value="immediate">
                        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-blue-600" />
                                    Top Priorities (Next 30 Days)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {strategy.immediate_actions?.map((action, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white text-xs font-bold">
                                                    {i + 1}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700">{action}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Portfolio Rebalancing */}
                    <TabsContent value="rebalancing">
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Analysis</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {strategy.portfolio_rebalancing?.analysis}
                                    </p>
                                </CardContent>
                            </Card>

                            {strategy.portfolio_rebalancing?.recommendations && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recommended Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {strategy.portfolio_rebalancing.recommendations.map((rec, i) => (
                                                <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                                    <p className="text-sm text-gray-700">{rec}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {strategy.portfolio_rebalancing?.timeline && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Timeline</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700">{strategy.portfolio_rebalancing.timeline}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* Market Trends */}
                    <TabsContent value="markets">
                        <div className="grid md:grid-cols-2 gap-4">
                            {strategy.market_trends?.emerging_trends && (
                                <Card className="border-emerald-200">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                                            Emerging Trends
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {strategy.market_trends.emerging_trends.map((trend, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <span className="text-emerald-600 font-bold">→</span>
                                                    {trend}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {strategy.market_trends?.opportunities && (
                                <Card className="border-blue-200">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-blue-600" />
                                            Opportunities
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {strategy.market_trends.opportunities.map((opp, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <span className="text-blue-600 font-bold">✓</span>
                                                    {opp}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {strategy.market_trends?.headwinds && (
                                <Card className="border-amber-200 md:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                                            Market Headwinds to Watch
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {strategy.market_trends.headwinds.map((headwind, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <span className="text-amber-600 font-bold">⚠</span>
                                                    {headwind}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* Risk Assessment */}
                    <TabsContent value="risks">
                        <div className="grid md:grid-cols-2 gap-4">
                            {strategy.risk_assessment?.concentration_risks && (
                                <Card className="border-red-200">
                                    <CardHeader>
                                        <CardTitle className="text-base">Concentration Risks</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {strategy.risk_assessment.concentration_risks.map((risk, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <span className="text-red-600 mt-1">•</span>
                                                    {risk}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {strategy.risk_assessment?.external_risks && (
                                <Card className="border-orange-200">
                                    <CardHeader>
                                        <CardTitle className="text-base">External Risks</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {strategy.risk_assessment.external_risks.map((risk, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <span className="text-orange-600 mt-1">•</span>
                                                    {risk}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {strategy.risk_assessment?.mitigations && (
                                <Card className="border-green-200 md:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            Mitigation Strategies
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {strategy.risk_assessment.mitigations.map((mit, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <span className="text-green-600 mt-1">→</span>
                                                    {mit}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* 12-Month Roadmap */}
                    <TabsContent value="roadmap">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-violet-600" />
                                    12-Month Strategic Roadmap
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {strategy.twelve_month_roadmap?.milestones && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">Key Milestones</h4>
                                        <div className="space-y-2">
                                            {strategy.twelve_month_roadmap.milestones.map((milestone, i) => (
                                                <div key={i} className="flex items-start gap-3 p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-200">
                                                    <Badge className="mt-1 flex-shrink-0">Q{Math.floor(i/3) + 1}</Badge>
                                                    <p className="text-sm text-gray-700">{milestone}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {strategy.twelve_month_roadmap?.expected_growth && (
                                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <p className="text-sm font-semibold text-gray-900 mb-1">Expected Growth</p>
                                        <p className="text-sm text-gray-700">{strategy.twelve_month_roadmap.expected_growth}</p>
                                    </div>
                                )}

                                {strategy.twelve_month_roadmap?.diversification_targets && (
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 mb-2">Diversification Targets</p>
                                        <div className="space-y-2">
                                            {strategy.twelve_month_roadmap.diversification_targets.map((target, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                                    {target}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            ) : (
                <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
                    <CardContent className="py-12 text-center">
                        <p className="text-gray-600">Unable to generate strategy. Please check your profile and portfolio data.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}