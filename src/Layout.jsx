import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import {
  Home, FolderHeart, Bookmark, TrendingUp, 
  LayoutDashboard, Users, Settings, Menu, X,
  Sparkles, BookOpen, Shield
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Portfolio', icon: FolderHeart, page: 'Portfolio' },
  { name: 'Bookmarks', icon: Bookmark, page: 'Bookmarks' },
  { name: 'Trends', icon: TrendingUp, page: 'Trends' },
  { name: 'Learn', icon: BookOpen, page: 'Learn' },
  { name: 'Discover', icon: Sparkles, page: 'DealDiscovery' },
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { name: 'Community', icon: Users, page: 'Community' },
  { name: 'Forum', icon: Users, page: 'Forum' },
  { name: 'Pipeline', icon: TrendingUp, page: 'DealPipeline' },
  { name: 'Collaborate', icon: Users, page: 'Collaborate' },
  { name: 'Settings', icon: Settings, page: 'ProfileSettings' }
];

const ADMIN_NAV_ITEM = { name: 'Admin', icon: Shield, page: 'Admin' };

export default function Layout({ children, currentPageName }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0618]">
      {/* Top Navigation */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-[#0f0618]/80 backdrop-blur-xl border-[#2d1e50] shadow-lg shadow-[#8b85f7]/20' 
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b85f7] via-[#00b7eb] to-[#ff8e42] flex items-center justify-center glow-primary">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gradient hidden sm:block">
                FlashFusion
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.slice(0, 6).map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link key={item.name} to={createPageUrl(item.page)}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className={`gap-2 ${
                        isActive 
                          ? 'bg-gradient-to-r from-[#8b85f7] to-[#583cf0] text-white hover:from-[#9a95ff] hover:to-[#6b4fff] glow-primary' 
                          : 'text-[#64748b] hover:text-[#8b85f7] hover:bg-[#2d1e50]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
              {user?.role === 'admin' && (
                <Link to={createPageUrl(ADMIN_NAV_ITEM.page)}>
                  <Button
                    variant={currentPageName === ADMIN_NAV_ITEM.page ? 'default' : 'ghost'}
                    className={`gap-2 ${
                      currentPageName === ADMIN_NAV_ITEM.page
                        ? 'bg-gradient-to-r from-[#8b85f7] to-[#583cf0] text-white hover:from-[#9a95ff] hover:to-[#6b4fff] glow-primary' 
                        : 'text-[#64748b] hover:text-[#8b85f7] hover:bg-[#2d1e50]'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    {ADMIN_NAV_ITEM.name}
                  </Button>
                </Link>
              )}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              <Link to={createPageUrl('ProfileSettings')} className="hidden md:block">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="w-5 h-5 text-gray-500" />
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-[#1a0f2e] border-l border-[#2d1e50] z-50 md:hidden shadow-2xl shadow-[#8b85f7]/20"
            >
              <div className="p-4">
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-xl text-gradient">Menu</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                <nav className="space-y-2">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPageName === item.page;
                    return (
                      <Link 
                        key={item.name} 
                        to={createPageUrl(item.page)}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            isActive 
                              ? 'bg-[#8b85f7]/20 text-[#8b85f7] border border-[#8b85f7]/50' 
                              : 'text-[#64748b] hover:bg-[#2d1e50] hover:text-[#8b85f7]'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                  {user?.role === 'admin' && (
                    <Link 
                      to={createPageUrl(ADMIN_NAV_ITEM.page)}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          currentPageName === ADMIN_NAV_ITEM.page
                            ? 'bg-[#8b85f7]/20 text-[#8b85f7] border border-[#8b85f7]/50' 
                            : 'text-[#64748b] hover:bg-[#2d1e50] hover:text-[#8b85f7]'
                        }`}
                      >
                        <Shield className="w-5 h-5" />
                        <span className="font-medium">{ADMIN_NAV_ITEM.name}</span>
                      </div>
                    </Link>
                  )}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#1a0f2e] border-t border-[#2d1e50] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] flex items-center justify-center glow-primary">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gradient">FlashFusion</span>
            </div>
            <p className="text-sm text-[#64748b]">
              AI-powered passive income platform with FlashFusion technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}