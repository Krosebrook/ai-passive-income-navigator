import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Clock, CheckCircle2 } from 'lucide-react';

/**
 * Path selection for onboarding: Quick Start vs Full Wizard
 */
export default function PathSelector({ onSelectPath }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          How would you like to get started?
        </h2>
        <p className="text-gray-600">
          Choose your path. You can always complete setup later.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Start */}
        <motion.div
          whileHover={{ y: -4 }}
          onClick={() => onSelectPath('quick_start')}
        >
          <Card className="cursor-pointer border-2 hover:border-[#8b85f7] transition-all h-full">
            <CardHeader className="bg-gradient-to-br from-[#8b85f7]/10 to-transparent">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-[#8b85f7]" />
                <CardTitle className="text-lg">Quick Start</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">5 minutes</span>
                </div>
                <p className="text-sm text-gray-600">
                  Answer 5 essential questions and start exploring immediately
                </p>
              </div>

              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Deal sourcing basics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Portfolio goals snapshot</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Complete setup later anytime</span>
                </li>
              </ul>

              <Button className="w-full bg-[#8b85f7] hover:bg-[#7a75e8]">
                Get Started Fast
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Full Wizard */}
        <motion.div
          whileHover={{ y: -4 }}
          onClick={() => onSelectPath('full_wizard')}
        >
          <Card className="cursor-pointer border-2 border-gray-200 hover:border-[#00b7eb] transition-all h-full">
            <CardHeader className="bg-gradient-to-br from-[#00b7eb]/10 to-transparent">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-[#00b7eb]" />
                <CardTitle className="text-lg">Full Setup</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">15-20 minutes</span>
                </div>
                <p className="text-sm text-gray-600">
                  Comprehensive setup for best recommendations and community match
                </p>
              </div>

              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Detailed deal criteria</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Community preferences</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Tool integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Platform walkthrough</span>
                </li>
              </ul>

              <Button className="w-full bg-[#00b7eb] hover:bg-[#00c4ff]">
                Full Personalization
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <p className="text-xs text-center text-gray-500 mt-8">
        Either way, you'll unlock full access to the platform and can customize anytime
      </p>
    </div>
  );
}