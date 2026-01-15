import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BrandGuide from '@/components/docs/BrandGuide';
import { BookOpen, Palette, Shield, Plug, Megaphone } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

/**
 * Documentation Hub
 * Central location for all platform documentation
 */
export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Documentation"
          subtitle="Complete guide to FlashFusion platform features and development"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-5 bg-[#1a0f2e]">
            <TabsTrigger value="overview">
              <BookOpen className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="brand">
              <Palette className="w-4 h-4 mr-2" />
              Brand
            </TabsTrigger>
            <TabsTrigger value="marketing">
              <Megaphone className="w-4 h-4 mr-2" />
              Marketing
            </TabsTrigger>
            <TabsTrigger value="admin">
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Plug className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="card-dark">
              <CardHeader>
                <CardTitle className="text-gradient">Platform Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#94a3b8]">
                <p>
                  FlashFusion is an AI-powered passive income platform that helps users discover,
                  validate, track, and monetize business opportunities.
                </p>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Key Features</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Browse 100+ passive income ideas</li>
                    <li>AI-powered idea validation and enrichment</li>
                    <li>Marketing content generation</li>
                    <li>Financial tracking and analytics</li>
                    <li>Community success stories</li>
                    <li>Market trend analysis</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Technology Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-[#8b85f7]/20 text-[#8b85f7]">React</Badge>
                    <Badge className="bg-[#00b7eb]/20 text-[#00b7eb]">Tailwind CSS</Badge>
                    <Badge className="bg-[#ff8e42]/20 text-[#ff8e42]">Base44</Badge>
                    <Badge className="bg-[#8b85f7]/20 text-[#8b85f7]">Framer Motion</Badge>
                    <Badge className="bg-[#00b7eb]/20 text-[#00b7eb]">React Query</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-dark">
              <CardHeader>
                <CardTitle className="text-gradient">Pages & Routes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Home', desc: 'Browse passive income ideas' },
                    { name: 'Portfolio', desc: 'Manage your ideas' },
                    { name: 'Dashboard', desc: 'Analytics overview' },
                    { name: 'Trends', desc: 'Market opportunities' },
                    { name: 'Community', desc: 'Success stories' },
                    { name: 'Learn', desc: 'Resources & guides' },
                    { name: 'Admin', desc: 'Platform management' },
                    { name: 'Documentation', desc: 'This page' }
                  ].map((page) => (
                    <div key={page.name} className="p-3 rounded-lg bg-[#1a0f2e] border border-[#2d1e50]">
                      <p className="font-semibold text-white">{page.name}</p>
                      <p className="text-sm text-[#64748b]">{page.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Brand Guide */}
          <TabsContent value="brand">
            <BrandGuide />
          </TabsContent>

          {/* Marketing */}
          <TabsContent value="marketing" className="space-y-6">
            <Card className="card-dark">
              <CardHeader>
                <CardTitle className="text-gradient">Marketing Content Generator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#94a3b8]">
                <p>
                  AI-powered tool for generating targeted marketing content across multiple platforms.
                </p>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Content Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-[#1a0f2e] border border-[#2d1e50]">
                      <p className="font-semibold text-white mb-2">📢 Ad Copy</p>
                      <p className="text-sm">Google Ads and Facebook advertising copy with headlines, descriptions, and CTAs</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#1a0f2e] border border-[#2d1e50]">
                      <p className="font-semibold text-white mb-2">📱 Social Media</p>
                      <p className="text-sm">Posts for LinkedIn, Twitter, and Instagram with hashtags and emojis</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#1a0f2e] border border-[#2d1e50]">
                      <p className="font-semibold text-white mb-2">✉️ Email Sequences</p>
                      <p className="text-sm">Complete email campaigns with subject lines and body content</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#1a0f2e] border border-[#2d1e50]">
                      <p className="font-semibold text-white mb-2">📝 SEO Blog Content</p>
                      <p className="text-sm">Optimized titles, keywords, meta descriptions, and outlines</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">How to Use</h3>
                  <ol className="space-y-2 list-decimal list-inside">
                    <li>Navigate to Portfolio page</li>
                    <li>Click dropdown menu (three dots) on any idea</li>
                    <li>Select "Marketing Content"</li>
                    <li>Choose content type and describe target audience</li>
                    <li>Generate and copy content</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">API Usage</h3>
                  <pre className="bg-[#0f0618] p-4 rounded-lg text-sm overflow-x-auto">
{`const response = await base44.functions.invoke(
  'generateMarketingContent',
  {
    ideaTitle: 'Your Idea',
    ideaDescription: 'Description',
    targetAudience: 'Your audience',
    contentType: 'ads' // or 'social', 'email', 'blog'
  }
);`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin */}
          <TabsContent value="admin" className="space-y-6">
            <Card className="card-dark">
              <CardHeader>
                <CardTitle className="text-gradient">Admin Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#94a3b8]">
                <p>
                  Admin-only features for platform management. Access is restricted to users with admin role.
                </p>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Access Control</h3>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Admin navigation link only visible to admin users</li>
                    <li>Page-level authentication checks</li>
                    <li>Backend function role verification</li>
                    <li>Automatic redirect for non-admin users</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Current Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-[#1a0f2e] border border-[#8b85f7]/50">
                      <p className="font-semibold text-[#8b85f7]">User Statistics</p>
                      <p className="text-sm">Total registered users</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#1a0f2e] border border-[#00b7eb]/50">
                      <p className="font-semibold text-[#00b7eb]">Data Overview</p>
                      <p className="text-sm">Total records tracked</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#1a0f2e] border border-[#ff8e42]/50">
                      <p className="font-semibold text-[#ff8e42]">Activity Monitor</p>
                      <p className="text-sm">Active users today</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#1a0f2e] border border-[#ff69b4]/50">
                      <p className="font-semibold text-[#ff69b4]">Security Status</p>
                      <p className="text-sm">System health</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Backend Protection</h3>
                  <pre className="bg-[#0f0618] p-4 rounded-lg text-sm overflow-x-auto">
{`const user = await base44.auth.me();
if (user?.role !== 'admin') {
  return Response.json(
    { error: 'Admin access required' },
    { status: 403 }
  );
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <Card className="card-dark">
              <CardHeader>
                <CardTitle className="text-gradient">External Integrations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#94a3b8]">
                <p>
                  Connect external services using OAuth connectors or API keys.
                </p>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Supported Services</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      'Salesforce', 'Slack', 'Notion', 'Google Calendar',
                      'Google Drive', 'Google Sheets', 'Google Docs', 'Google Slides',
                      'HubSpot', 'LinkedIn', 'TikTok', 'Stripe'
                    ].map((service) => (
                      <Badge key={service} className="badge-primary">{service}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">OAuth Integration</h3>
                  <p className="mb-2">Access tokens in backend functions:</p>
                  <pre className="bg-[#0f0618] p-4 rounded-lg text-sm overflow-x-auto">
{`const accessToken = await base44
  .asServiceRole
  .connectors
  .getAccessToken('slack');

// Use in API call
fetch('https://api.slack.com/...', {
  headers: {
    'Authorization': \`Bearer \${accessToken}\`
  }
});`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Custom APIs (Stripe Example)</h3>
                  <pre className="bg-[#0f0618] p-4 rounded-lg text-sm overflow-x-auto">
{`import Stripe from 'npm:stripe';
const stripe = new Stripe(
  Deno.env.get('STRIPE_API_KEY')
);

// Create checkout session
const session = await stripe
  .checkout.sessions.create({...});`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}