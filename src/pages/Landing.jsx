import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, TrendingUp, Shield, Users, Download, X, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Detect if app is installed
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
    });
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choiceResult = await installPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const features = [
    { icon: Zap, title: 'AI Deal Discovery', desc: 'Daily sourced passive income opportunities matched to your profile' },
    { icon: TrendingUp, title: 'Smart Analytics', desc: 'AI-powered ROI analysis and scenario modeling for every deal' },
    { icon: Shield, title: 'Secure Backups', desc: 'Automated encrypted backups and full data export on-demand' },
    { icon: Users, title: 'Community Network', desc: 'Connect with other investors, share watchlists, discuss strategies' },
  ];

  const pricingTiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      desc: 'Get started with daily deal discovery',
      features: [
        '1 AI deal per day',
        'Basic portfolio tracking',
        'Read-only community access',
        'Email alerts',
      ],
      cta: 'Start Free',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: '/month',
      desc: 'For serious passive income builders',
      features: [
        '20 AI deals per month',
        'Advanced scenario modeling',
        'Data exports & backups',
        'Community posting & discussions',
        'Performance analytics',
        'Deal comparison tools',
      ],
      cta: 'Upgrade to Pro',
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      desc: 'For teams & institutions',
      features: [
        'Unlimited deal analysis',
        'Team workspaces & SSO',
        'Custom scoring & integrations',
        'Audit-ready exports',
        'Dedicated support',
        'API access',
      ],
      cta: 'Contact Sales',
      highlight: false,
    },
  ];

  const faqs = [
    {
      q: 'How does AI deal matching work?',
      a: 'Our AI analyzes your investment criteria, risk tolerance, and portfolio goals to surface opportunities from 50+ global sources daily. Each deal includes viability scoring and market analysis.',
    },
    {
      q: 'Can I export my portfolio data?',
      a: 'Yes. Pro and Enterprise users can export all portfolio data as CSV, JSON, or PDF. Free users can export once per month. All data is encrypted and backed up daily.',
    },
    {
      q: 'What if I want to cancel?',
      a: 'Cancel anytime. Your access continues through the end of your billing period. No penalties or questions asked.',
    },
    {
      q: 'Do you offer annual discounts?',
      a: 'Yes. Pay annually and save 20% on Pro plans. Reach out to sales for Enterprise annual pricing.',
    },
    {
      q: 'Is my investment data private?',
      a: 'Completely. Data is end-to-end encrypted. We never share or sell portfolio information. See our privacy policy for full details.',
    },
    {
      q: 'What countries do you serve?',
      a: 'We support deals and market data globally, with strongest coverage in US, UK, EU, and Commonwealth markets.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f0618] text-white overflow-hidden">
      {/* Fixed Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#1a0f2e] via-[#0f0618] to-[#0f0618]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#8b85f7] rounded-full blur-3xl opacity-10" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00b7eb] rounded-full blur-3xl opacity-10" />
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#2d1e50]/30 bg-[#0f0618]/80 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] flex items-center justify-center glow-primary">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gradient hidden sm:block">FlashFusion</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-[#64748b] hover:text-[#8b85f7] text-sm">Features</a>
            <a href="#pricing" className="text-[#64748b] hover:text-[#8b85f7] text-sm">Pricing</a>
            <a href="#faq" className="text-[#64748b] hover:text-[#8b85f7] text-sm">FAQ</a>
            <Button variant="ghost" size="sm" className="text-[#64748b] hover:text-[#8b85f7]" onClick={() => window.location.href = createPageUrl('Home')}>
              Log In
            </Button>
            {!isInstalled && installPrompt && (
              <Button onClick={handleInstall} className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0] text-white hover:from-[#9a95ff] hover:to-[#6b4fff]">
                <Download className="w-4 h-4 mr-2" />
                Add to Home
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden border-t border-[#2d1e50]/30 bg-[#1a0f2e]/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-[#64748b] hover:text-[#8b85f7]">Features</a>
              <a href="#pricing" className="block text-[#64748b] hover:text-[#8b85f7]">Pricing</a>
              <a href="#faq" className="block text-[#64748b] hover:text-[#8b85f7]">FAQ</a>
              <Button variant="ghost" className="w-full text-[#64748b] hover:text-[#8b85f7]" onClick={() => window.location.href = createPageUrl('Home')}>
                Log In
              </Button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-gradient">
              Automated AI-Driven Passive Income Discovery
            </h1>
            <p className="text-xl text-[#64748b] mb-8">
              Get daily AI-sourced investment opportunities, intelligent lifecycle guidance, and a thriving community of passive income builders. Find deals others miss. Validate faster. Build smarter.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {!isInstalled && installPrompt && (
                <Button onClick={handleInstall} size="lg" className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0] text-white hover:from-[#9a95ff] hover:to-[#6b4fff] glow-primary">
                  <Download className="w-5 h-5 mr-2" />
                  Add to Home Screen
                </Button>
              )}
              {isInstalled && (
                <Button size="lg" className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0] text-white hover:from-[#9a95ff] hover:to-[#6b4fff]" onClick={() => window.location.href = createPageUrl('Home')}>
                  Open App
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
              {!isInstalled && !installPrompt && (
                <Button size="lg" className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0] text-white hover:from-[#9a95ff] hover:to-[#6b4fff]" onClick={() => window.location.href = createPageUrl('Home')}>
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
              <Button size="lg" variant="outline" className="border-[#2d1e50] text-[#8b85f7] hover:bg-[#2d1e50]" onClick={() => window.location.href = createPageUrl('Home')}>
                Log In
              </Button>
            </div>

            <p className="text-sm text-[#64748b]">Free tier available. No credit card required.</p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-3xl font-bold text-center mb-16">
            Why Choose FlashFusion?
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#1a0f2e]/50 border border-[#2d1e50] rounded-xl p-6 backdrop-blur-sm"
                >
                  <Icon className="w-10 h-10 text-[#8b85f7] mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-[#64748b]">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-[#64748b]">Choose the plan that fits your passive income journey.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-xl p-8 border backdrop-blur-sm transition-all ${
                  tier.highlight
                    ? 'bg-gradient-to-b from-[#8b85f7]/20 to-[#583cf0]/10 border-[#8b85f7]/50 shadow-lg shadow-[#8b85f7]/20'
                    : 'bg-[#1a0f2e]/50 border-[#2d1e50]'
                }`}
              >
                {tier.highlight && (
                  <div className="inline-block bg-[#8b85f7]/30 text-[#8b85f7] text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-[#64748b] text-sm mb-4">{tier.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-[#64748b] text-sm">/{tier.period}</span>
                </div>
                <Button
                  className={`w-full mb-8 ${
                    tier.highlight
                      ? 'bg-gradient-to-r from-[#8b85f7] to-[#583cf0] text-white hover:from-[#9a95ff] hover:to-[#6b4fff]'
                      : 'border border-[#2d1e50] text-[#8b85f7] hover:bg-[#2d1e50]'
                  }`}
                  onClick={() => window.location.href = createPageUrl('Home')}
                >
                  {tier.cta}
                </Button>
                <ul className="space-y-3">
                  {tier.features.map((f, j) => (
                    <li key={j} className="text-sm text-[#64748b] flex items-start">
                      <span className="text-[#10b981] mr-3">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-3xl font-bold text-center mb-16">
            Frequently Asked Questions
          </motion.h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-[#1a0f2e]/50 border border-[#2d1e50] rounded-lg p-6 cursor-pointer"
              >
                <summary className="flex items-center justify-between font-semibold text-lg">
                  {faq.q}
                  <span className="text-[#8b85f7] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-[#64748b] mt-4">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to automate your passive income discovery?</h2>
          <p className="text-[#64748b] mb-8">Join hundreds of passive income builders using AI to find opportunities faster.</p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0] text-white hover:from-[#9a95ff] hover:to-[#6b4fff] glow-primary"
            onClick={() => window.location.href = createPageUrl('Home')}
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2d1e50] bg-[#1a0f2e]/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[#64748b]">
                <li><a href="#features" className="hover:text-[#8b85f7]">Features</a></li>
                <li><a href="#pricing" className="hover:text-[#8b85f7]">Pricing</a></li>
                <li><a href={createPageUrl('Documentation')} className="hover:text-[#8b85f7]">Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[#64748b]">
                <li><a href="#" className="hover:text-[#8b85f7]">About</a></li>
                <li><a href="#" className="hover:text-[#8b85f7]">Blog</a></li>
                <li><a href="#" className="hover:text-[#8b85f7]">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[#64748b]">
                <li><a href="#" className="hover:text-[#8b85f7]">Privacy</a></li>
                <li><a href="#" className="hover:text-[#8b85f7]">Terms</a></li>
                <li><a href="#" className="hover:text-[#8b85f7]">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#2d1e50] pt-8 text-center text-sm text-[#64748b]">
            <p>&copy; 2026 FlashFusion. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      {!isInstalled && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[#2d1e50] bg-[#1a0f2e]/95 backdrop-blur-xl p-4 z-40"
        >
          <Button
            className="w-full bg-gradient-to-r from-[#8b85f7] to-[#583cf0] text-white hover:from-[#9a95ff] hover:to-[#6b4fff]"
            onClick={installPrompt ? handleInstall : () => window.location.href = createPageUrl('Home')}
          >
            {installPrompt ? (
              <>
                <Download className="w-4 h-4 mr-2" />
                Add to Home Screen
              </>
            ) : (
              <>
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}