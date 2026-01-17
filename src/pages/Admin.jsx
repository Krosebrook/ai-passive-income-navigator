import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Database, Activity } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

/**
 * Admin Dashboard Page
 * 
 * Platform administration dashboard with user statistics, data overview,
 * activity monitoring, and system health indicators.
 * 
 * Access is restricted to users with role === 'admin'.
 * Non-admin users are automatically redirected to home page.
 * 
 * @component
 * @requires Admin role
 */
export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData?.role !== 'admin') {
          window.location.href = '/';
        }
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Admin Dashboard"
          subtitle="Manage your FlashFusion platform"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <Card className="card-dark border-neon-purple">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#8b85f7]">
                <Users className="w-5 h-5" />
                Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">-</p>
              <p className="text-sm text-[#64748b] mt-2">Total registered users</p>
            </CardContent>
          </Card>

          <Card className="card-dark border-neon-cyan">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#00b7eb]">
                <Database className="w-5 h-5" />
                Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">-</p>
              <p className="text-sm text-[#64748b] mt-2">Total records</p>
            </CardContent>
          </Card>

          <Card className="card-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#ff8e42]">
                <Activity className="w-5 h-5" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">-</p>
              <p className="text-sm text-[#64748b] mt-2">Active today</p>
            </CardContent>
          </Card>

          <Card className="card-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#ff69b4]">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">Active</p>
              <p className="text-sm text-[#64748b] mt-2">System status</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="card-dark">
            <CardHeader>
              <CardTitle className="text-gradient">AI Automation Features</CardTitle>
              <CardDescription className="text-[#64748b]">
                Manage AI-powered deal pipeline automation and user engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Deal Pipeline Automation</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#1a0f2e] rounded-lg border border-[#2d1e50]">
                      <h4 className="font-medium text-white mb-2">Auto-Categorization</h4>
                      <p className="text-sm text-gray-400">AI categorizes incoming deals as hot/warm/cold leads based on criteria</p>
                      <p className="text-xs text-violet-400 mt-2 font-mono">categorizeDeal</p>
                      </div>
                      <div className="p-4 bg-[#1a0f2e] rounded-lg border border-[#2d1e50]">
                      <h4 className="font-medium text-white mb-2">Deal Comparison</h4>
                      <p className="text-sm text-gray-400">Compare multiple deals side-by-side with AI recommendations</p>
                      <p className="text-xs text-cyan-400 mt-2 font-mono">compareDeals</p>
                      </div>
                      <div className="p-4 bg-[#1a0f2e] rounded-lg border border-[#2d1e50]">
                      <h4 className="font-medium text-white mb-2">Summary Reports</h4>
                      <p className="text-sm text-gray-400">Auto-generate comprehensive deal analysis reports</p>
                      <p className="text-xs text-emerald-400 mt-2 font-mono">generateDealReport</p>
                      </div>
                      <div className="p-4 bg-[#1a0f2e] rounded-lg border border-[#2d1e50]">
                      <h4 className="font-medium text-white mb-2">Nurturing Workflows</h4>
                      <p className="text-sm text-gray-400">Automated follow-ups and engagement tracking</p>
                      <p className="text-xs text-orange-400 mt-2 font-mono">DealNurturingWorkflow</p>
                      </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Onboarding & Engagement</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#1a0f2e] rounded-lg border border-[#2d1e50]">
                      <h4 className="font-medium text-white mb-2">AI Onboarding Insights</h4>
                      <p className="text-sm text-gray-400">Personalized guidance during user onboarding flow</p>
                      <p className="text-xs text-violet-400 mt-2 font-mono">generateOnboardingInsights</p>
                      </div>
                      <div className="p-4 bg-[#1a0f2e] rounded-lg border border-[#2d1e50]">
                      <h4 className="font-medium text-white mb-2">Advanced Learning Modules</h4>
                      <p className="text-sm text-gray-400">Optional M&A, financial modeling, and due diligence training</p>
                      <p className="text-xs text-cyan-400 mt-2 font-mono">AdvancedModulesStep</p>
                      </div>
                      <div className="p-4 bg-[#1a0f2e] rounded-lg border border-[#2d1e50]">
                      <h4 className="font-medium text-white mb-2">Smart Nudges</h4>
                      <p className="text-sm text-gray-400">Post-onboarding feature discovery prompts</p>
                      <p className="text-xs text-emerald-400 mt-2 font-mono">generateOnboardingNudges</p>
                      </div>
                      <div className="p-4 bg-[#1a0f2e] rounded-lg border border-[#2d1e50]">
                      <h4 className="font-medium text-white mb-2">Adaptive Questions</h4>
                      <p className="text-sm text-gray-400">Onboarding wizard adapts based on user responses</p>
                      <p className="text-xs text-orange-400 mt-2 font-mono">EnhancedOnboardingWizard</p>
                      </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-violet-900/20 to-purple-900/20 rounded-lg border border-violet-500/30">
                  <p className="text-sm text-violet-300 mb-2">
                    <strong>✨ All AI features are active and ready to use!</strong> Users can access deal automation from the Pipeline page, comparison tools in Deal Discovery, and enhanced onboarding when they first sign up.
                  </p>
                  <p className="text-xs text-violet-400">
                    📚 View complete documentation in the "Docs" section from the main navigation menu.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}