import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkInstallState = () => {
      const ua = navigator.userAgent;
      setIsIOS(/iPad|iPhone|iPod/.test(ua) && !window.MSStream);
      
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    checkInstallState();

    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  if (isInstalled || dismissed) return null;

  // iOS fallback
  if (isIOS && !installPrompt) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 left-4 right-4 bg-[#1a0f2e] border border-[#2d1e50] rounded-lg p-4 md:bottom-8 md:right-8 md:left-auto md:max-w-sm shadow-xl z-40"
        >
          <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 p-1">
            <X className="w-4 h-4 text-[#64748b] hover:text-white" />
          </button>
          <h3 className="font-semibold mb-2 pr-6">Add to Home Screen</h3>
          <p className="text-sm text-[#64748b] mb-3">
            Tap <span className="font-mono bg-[#2d1e50] px-1 rounded">Share</span> → <span className="font-mono bg-[#2d1e50] px-1 rounded">Add to Home Screen</span>
          </p>
          <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setDismissed(true)}>
            Got It
          </Button>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!installPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-[#8b85f7]/20 to-[#583cf0]/20 border border-[#8b85f7]/50 rounded-lg p-4 md:bottom-8 md:right-8 md:left-auto md:max-w-sm shadow-xl backdrop-blur-sm z-40"
      >
        <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 p-1">
          <X className="w-4 h-4 text-[#64748b] hover:text-white" />
        </button>
        <div className="flex items-start gap-3 pr-6">
          <Download className="w-5 h-5 text-[#8b85f7] mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Install FlashFusion</h3>
            <p className="text-sm text-[#64748b] mb-3">Add to your home screen for quick access and offline support.</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0] text-white hover:from-[#9a95ff] hover:to-[#6b4fff]"
                onClick={handleInstall}
              >
                Install
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-[#2d1e50] text-[#8b85f7]"
                onClick={() => setDismissed(true)}
              >
                Later
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}