import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function LandingPageGuide() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-gradient-to-r from-[#8b85f7]/10 to-[#583cf0]/10 border border-[#8b85f7]/20 rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Landing Page Implementation Guide</h1>
        <p className="text-[#64748b]">Safe, additive PWA-first landing for FlashFusion passive income platform</p>
      </div>

      {/* Part 1: Web Research Synthesis */}
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardHeader>
          <CardTitle className="text-xl">1. Research Synthesis: IdeaBrowser Patterns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-[#8b85f7] mb-2">Tier Structure (Ideabrowser)</h3>
            <ul className="space-y-2 text-sm text-[#64748b]">
              <li><strong>Starter:</strong> $499/yr (€1.37/day) — idea database, trends, basic tools</li>
              <li><strong>Pro:</strong> $1,499/yr (€4.11/day) — AI agents, research, exports, advanced</li>
              <li><strong>Empire:</strong> $2,999/yr (€8.22/day) — all access + coaching, community, tool deals</li>
            </ul>
          </div>
          <div className="border-t border-[#2d1e50] pt-4">
            <h3 className="font-semibold text-[#8b85f7] mb-2">Adapted for FlashFusion (Passive Income)</h3>
            <ul className="space-y-2 text-sm text-[#64748b]">
              <li><strong>Free:</strong> $0 — 1 AI deal/day, basic portfolio, read-only community</li>
              <li><strong>Pro:</strong> $9.99/mo — 20 deals/mo, analytics, exports, scenario modeling</li>
              <li><strong>Enterprise:</strong> Custom — unlimited, team workspaces, SSO, API</li>
            </ul>
          </div>
          <div className="border-t border-[#2d1e50] pt-4">
            <h3 className="font-semibold text-[#8b85f7] mb-2">Key Patterns Borrowed</h3>
            <ul className="space-y-2 text-sm text-[#64748b]">
              <li>✓ <strong>Free "taste":</strong> Daily email (Idea of the Day) to hook users</li>
              <li>✓ <strong>2-tier paywall:</strong> Pro for builders, Enterprise for teams</li>
              <li>✓ <strong>Quota system:</strong> API calls, exports, scenario runs (tracked per tier)</li>
              <li>✓ <strong>Before/After narrative:</strong> "Months of research → shipped in days"</li>
              <li>✓ <strong>Community + coaching:</strong> Pro/Enterprise exclusive (retention lever)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Part 2: Files Added */}
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardHeader>
          <CardTitle className="text-xl">2. Files Created (Additive Only)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-mono font-semibold">pages/Landing.js</p>
                <p className="text-[#64748b]">Public PWA-first landing page. New route. No impact on existing /home or auth.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-mono font-semibold">components/pwa/PWAInstallPrompt.js</p>
                <p className="text-[#64748b]">Reusable install banner. Added to Layout. Safe toggle.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-mono font-semibold">components/paywall/TierGate.js</p>
                <p className="text-[#64748b]">Reusable paywall wrapper. Checks tier before rendering. Easy to add to any feature.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-mono font-semibold">components/seo/SEOHead.js</p>
                <p className="text-[#64748b]">Per-page SEO tags (OG, Twitter, canonical). Use on any page.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-mono font-semibold">entities/Subscription.json</p>
                <p className="text-[#64748b]">Tier + quota tracking. Tied to user email.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-mono font-semibold">functions/registerServiceWorker.js</p>
                <p className="text-[#64748b]">Helper to register SW at app boot. Call in pages/Home useEffect.</p>
              </div>
            </div>
          </div>
          <div className="bg-[#2d1e50]/50 rounded p-3 text-xs text-[#64748b]">
            <strong>Note:</strong> Service Worker, manifest, offline shell → placed in `public/` (Base44 serves automatically). Not editable via API yet, but documented for deployment.
          </div>
        </CardContent>
      </Card>

      {/* Part 3: Safety & Backwards Compat */}
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            3. Safety Constraints Met
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
            <p><strong>✓ No Route Deletions:</strong> Existing /home, /portfolio, /admin untouched.</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
            <p><strong>✓ No Auth Rewrites:</strong> Landing is public. Auth flow unchanged. Paywall via client-side TierGate.</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
            <p><strong>✓ No Global CSS Changes:</strong> Landing uses existing Tailwind + globals.css. No breakage.</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
            <p><strong>✓ Additive Layout Update:</strong> Added PWAInstallPrompt to Layout. Can toggle off with prop.</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
            <p><strong>✓ No Entity Modifications:</strong> Added Subscription entity. No existing entities changed.</p>
          </div>
        </CardContent>
      </Card>

      {/* Part 4: Smoke Tests */}
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardHeader>
          <CardTitle className="text-xl">4. Smoke Test Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold text-[#8b85f7] mb-2">Landing Page</h4>
            <ul className="space-y-1 text-[#64748b] ml-4">
              <li>□ Navigate to /landing — renders without errors</li>
              <li>□ Hero CTA "Add to Home Screen" appears (if installPrompt available)</li>
              <li>□ iOS fallback text visible on Safari iOS</li>
              <li>□ Hero CTA "Get Started" links to /home</li>
              <li>□ Pricing section displays 3 tiers</li>
              <li>□ FAQ details expand/collapse</li>
              <li>□ All external links work (no 404s)</li>
              <li>□ Mobile responsive (test 375px, 768px, 1200px)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#8b85f7] mb-2">Auth & Paywall</h4>
            <ul className="space-y-1 text-[#64748b] ml-4">
              <li>□ Click "Log In" from landing → redirects to auth</li>
              <li>□ Google/Apple/Microsoft login still works</li>
              <li>□ After login, user sees /home (not landing)</li>
              <li>□ TierGate component blocks Pro features for Free users</li>
              <li>□ "Upgrade Now" button in TierGate visible</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#8b85f7] mb-2">PWA & Offline</h4>
            <ul className="space-y-1 text-[#64748b] ml-4">
              <li>□ Install prompt appears on first visit (Chrome, Edge)</li>
              <li>□ After install, app shows in standalone mode</li>
              <li>□ DevTools → Application → Cache Storage shows precached assets</li>
              <li>□ Go offline (DevTools → Network → Offline) → /landing still loads</li>
              <li>□ Offline shell shows graceful fallback (offline.html)</li>
              <li>□ Service Worker registered (check DevTools → Application → Service Workers)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#8b85f7] mb-2">Core Web Vitals</h4>
            <ul className="space-y-1 text-[#64748b] ml-4">
              <li>□ LCP &lt; 2.5s (hero image preloaded with fetchPriority)</li>
              <li>□ INP &lt; 200ms (no long main-thread tasks)</li>
              <li>□ CLS &lt; 0.1 (all images have fixed dimensions)</li>
              <li>□ Run Lighthouse → check "Performance" score</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#8b85f7] mb-2">Regression Check</h4>
            <ul className="space-y-1 text-[#64748b] ml-4">
              <li>□ /home still loads and shows deals</li>
              <li>□ /portfolio still works</li>
              <li>□ /admin still visible to admins</li>
              <li>□ Nudge system still triggers</li>
              <li>□ Existing components render without console errors</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Part 5: Deployment & Feature Flags */}
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Info className="w-5 h-5" />
            5. Rollback & Feature Flags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[#64748b]">
          <div>
            <h4 className="font-semibold text-[#8b85f7] mb-2">If Issues Arise</h4>
            <ul className="space-y-1 ml-4">
              <li>• <strong>Landing doesn't render:</strong> Check if route /landing is registered. Revert pages/Landing.js to previous version.</li>
              <li>• <strong>PWA install broken:</strong> Comment out PWAInstallPrompt import in Layout.js. No user impact; existing app still works.</li>
              <li>• <strong>TierGate blocks all users:</strong> Check Subscription entity has records. Fallback to free tier for missing users.</li>
              <li>• <strong>Service Worker cache stale:</strong> User can manually clear cache in Settings or DevTools → Application → Storage → Clear.</li>
            </ul>
          </div>
          <div className="bg-[#2d1e50]/50 rounded p-3">
            <p><strong>Revert Time:</strong> &lt;5 minutes. All changes are file additions/edits. No schema breaking. No data loss.</p>
          </div>
        </CardContent>
      </Card>

      {/* Part 6: Next Steps */}
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardHeader>
          <CardTitle className="text-xl">6. Next Steps & Optional Enhancements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[#64748b]">
          <div>
            <h4 className="font-semibold text-[#8b85f7] mb-2">Immediate (Recommended)</h4>
            <ul className="space-y-1 ml-4">
              <li>1. Deploy public/manifest.json + service-worker.js + offline.html (ask Base44 team)</li>
              <li>2. Call registerServiceWorker() in pages/Home useEffect or main App init</li>
              <li>3. Run Lighthouse audit on /landing → target LCP &lt; 2.5s</li>
              <li>4. Add Stripe integration for Pro/Enterprise billing (separate phase)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#8b85f7] mb-2">Follow-up (Phase 2)</h4>
            <ul className="space-y-1 ml-4">
              <li>• Add more OAuth providers (GitHub, LinkedIn, Discord)</li>
              <li>• Implement quota tracking in Subscription entity (track API calls per day)</li>
              <li>• Add analytics to landing (Mixpanel, Segment) to track CTR, install rate</li>
              <li>• A/B test CTA copy ("Add to Home Screen" vs "Get Started")</li>
              <li>• Build blog section (for SEO keyword targeting)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}