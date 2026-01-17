import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    CheckCircle2, AlertCircle, Settings, Link2, Clock,
    Zap, DollarSign, MessageSquare, Brain, FileText, Calendar
} from 'lucide-react';

const INTEGRATIONS = [
    // AI/LLM
    { id: 'openai', name: 'OpenAI', category: 'ai_llm', icon: Brain, description: 'GPT models for analysis' },
    { id: 'anthropic', name: 'Anthropic', category: 'ai_llm', icon: Brain, description: 'Claude LLM' },
    { id: 'perplexity', name: 'Perplexity', category: 'ai_llm', icon: Brain, description: 'Web search + AI' },
    
    // Deal Sourcing
    { id: 'firecrawl', name: 'Firecrawl', category: 'deal_sourcing', icon: Link2, description: 'Web scraping' },
    { id: 'flippa', name: 'Flippa', category: 'deal_sourcing', icon: Zap, description: 'Website marketplace' },
    { id: 'empire_flippers', name: 'Empire Flippers', category: 'deal_sourcing', icon: Zap, description: 'Business listings' },
    { id: 'microacquire', name: 'MicroAcquire', category: 'deal_sourcing', icon: Zap, description: 'Deal marketplace' },
    { id: 'angellist', name: 'AngelList', category: 'deal_sourcing', icon: Zap, description: 'Startup deals' },
    { id: 'crunchbase', name: 'Crunchbase', category: 'deal_sourcing', icon: Link2, description: 'Company data' },
    
    // Financial Data
    { id: 'finnhub', name: 'Finnhub', category: 'financial_data', icon: DollarSign, description: 'Stock & market data' },
    { id: 'alpha_vantage', name: 'Alpha Vantage', category: 'financial_data', icon: DollarSign, description: 'Financial data' },
    { id: 'polygon', name: 'Polygon.io', category: 'financial_data', icon: DollarSign, description: 'Market data API' },
    { id: 'yahoo_finance', name: 'Yahoo Finance', category: 'financial_data', icon: DollarSign, description: 'Stock data' },
    { id: 'zillow', name: 'Zillow', category: 'financial_data', icon: DollarSign, description: 'Real estate data' },
    
    // Communication
    { id: 'slack', name: 'Slack', category: 'communication', icon: MessageSquare, description: 'Messaging' },
    { id: 'discord', name: 'Discord', category: 'communication', icon: MessageSquare, description: 'Community chat' },
    { id: 'twilio', name: 'Twilio', category: 'communication', icon: MessageSquare, description: 'SMS/Phone' },
    { id: 'email', name: 'Email/SMTP', category: 'communication', icon: MessageSquare, description: 'Email delivery' },
    
    // Documents
    { id: 'google_docs', name: 'Google Docs', category: 'document', icon: FileText, description: 'Document creation' },
    { id: 'notion', name: 'Notion', category: 'document', icon: FileText, description: 'Note-taking' },
    { id: 'google_drive', name: 'Google Drive', category: 'document', icon: FileText, description: 'File storage' },
    
    // Scheduling
    { id: 'google_calendar', name: 'Google Calendar', category: 'scheduling', icon: Calendar, description: 'Calendar sync' },
    { id: 'calendly', name: 'Calendly', category: 'scheduling', icon: Calendar, description: 'Meeting scheduling' },
    
    // Analytics
    { id: 'google_analytics', name: 'Google Analytics', category: 'analytics', icon: Zap, description: 'Web analytics' },
    { id: 'mixpanel', name: 'Mixpanel', category: 'analytics', icon: Zap, description: 'Event analytics' },
    
    // Automation
    { id: 'zapier', name: 'Zapier', category: 'automation', icon: Zap, description: 'Workflow automation' }
];

export default function IntegrationManager() {
    const { data: configs = [] } = useQuery({
        queryKey: ['integrations'],
        queryFn: async () => {
            const results = await base44.entities.IntegrationConfig.filter({});
            return results;
        }
    });

    const getStatus = (serviceId) => {
        const config = configs.find(c => c.service_name === serviceId);
        if (!config) return 'not_configured';
        if (!config.api_key_configured) return 'not_configured';
        if (config.connection_status === 'error') return 'error';
        if (config.is_enabled) return 'connected';
        return 'configured';
    };

    const categories = ['ai_llm', 'deal_sourcing', 'financial_data', 'communication', 'document', 'scheduling', 'analytics', 'automation'];

    return (
        <div className="space-y-6">
            <Tabs defaultValue="ai_llm" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                    {categories.map(cat => (
                        <TabsTrigger key={cat} value={cat} className="text-xs">
                            {cat.replace(/_/g, ' ')}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {categories.map(category => (
                    <TabsContent key={category} value={category}>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {INTEGRATIONS.filter(i => i.category === category).map(integration => {
                                const Icon = integration.icon;
                                const status = getStatus(integration.id);
                                const statusConfig = {
                                    not_configured: { color: 'text-gray-400', bg: 'bg-gray-50' },
                                    configured: { color: 'text-amber-500', bg: 'bg-amber-50' },
                                    connected: { color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                    error: { color: 'text-red-500', bg: 'bg-red-50' }
                                };

                                return (
                                    <Card key={integration.id} className={statusConfig[status].bg}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <Icon className={`w-5 h-5 ${statusConfig[status].color}`} />
                                                <div className={`w-2 h-2 rounded-full ${statusConfig[status].color.replace('text-', 'bg-')}`} />
                                            </div>
                                            <CardTitle className="text-sm">{integration.name}</CardTitle>
                                            <p className="text-xs text-gray-600">{integration.description}</p>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <Badge variant="outline" className="text-xs">
                                                {status.replace(/_/g, ' ')}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full"
                                            >
                                                <Settings className="w-3 h-3 mr-2" />
                                                Configure
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}