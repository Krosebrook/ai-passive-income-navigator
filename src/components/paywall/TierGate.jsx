import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TierGate({ requiredTier = 'pro', children, fallback }) {
  const [userTier, setUserTier] = useState('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserTier = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          // Check subscription via user preferences or a dedicated subscription entity
          const prefs = await base44.entities.UserPreferences.filter({ user_email: user.email });
          setUserTier(prefs[0]?.subscription_tier || 'free');
        }
      } catch (e) {
        console.log('Tier check skipped (not logged in)');
      } finally {
        setLoading(false);
      }
    };
    fetchUserTier();
  }, []);

  const tierHierarchy = { free: 0, pro: 1, enterprise: 2 };
  const hasAccess = tierHierarchy[userTier] >= tierHierarchy[requiredTier];

  if (loading) return null;

  if (!hasAccess) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center p-12 bg-[#1a0f2e]/50 border border-[#2d1e50] rounded-xl">
          <Lock className="w-12 h-12 text-[#8b85f7] mb-4" />
          <h3 className="text-xl font-semibold mb-2">Premium Feature</h3>
          <p className="text-[#64748b] text-center mb-6">Upgrade to {requiredTier === 'pro' ? 'Pro' : 'Enterprise'} to unlock this feature.</p>
          <Button className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0] text-white">
            Upgrade Now
          </Button>
        </div>
      )
    );
  }

  return children;
}