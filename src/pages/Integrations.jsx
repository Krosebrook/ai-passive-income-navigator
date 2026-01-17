import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import IntegrationManager from '@/components/integrations/IntegrationManager';
import { Zap } from 'lucide-react';

export default function IntegrationsPage() {
    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <PageHeader
                    title="Integrations"
                    subtitle="Connect external services to unlock automation and data insights"
                />

                <div className="mt-8">
                    <IntegrationManager />
                </div>
            </div>
        </div>
    );
}