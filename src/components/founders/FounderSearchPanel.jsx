import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Users, Search, Mail, Linkedin, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function FounderSearchPanel({ deal }) {
  const [isSearching, setIsSearching] = useState(false);
  const [founders, setFounders] = useState([]);
  const [selectedFounder, setSelectedFounder] = useState(null);
  const [outreach, setOutreach] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const searchMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('identifyPotentialFounders', {
        deal_id: deal?.id,
        founder_profile: deal ? null : { industry: 'Technology' }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setFounders(data.founders || []);
      toast.success(`Found ${data.founders?.length || 0} potential founders`);
    }
  });

  const outreachMutation = useMutation({
    mutationFn: async (founder) => {
      const response = await base44.functions.invoke('generateFounderOutreach', {
        founder_name: founder.name,
        founder_profile: founder,
        deal_title: deal?.title || 'Investment Opportunity',
        deal_summary: deal?.summary || ''
      });
      return response.data;
    },
    onSuccess: (data) => {
      setOutreach(data.outreach);
    }
  });

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      await searchMutation.mutateAsync();
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateOutreach = async (founder) => {
    setSelectedFounder(founder);
    await outreachMutation.mutateAsync(founder);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-[#8b85f7]" />
            Founder Search
          </h3>
          <p className="text-xs text-[#64748b] mt-1">
            AI-powered founder identification from external platforms
          </p>
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          size="sm"
          className="gap-2"
        >
          <Search className="w-4 h-4" />
          {isSearching ? 'Searching...' : 'Find Founders'}
        </Button>
      </div>

      {founders.length === 0 && !isSearching && (
        <Card className="border-[#2d1e50] bg-[#1a0f2e]">
          <CardContent className="py-8 text-center">
            <Users className="w-10 h-10 text-[#64748b] mx-auto mb-3" />
            <p className="text-sm text-[#64748b]">
              Click "Find Founders" to identify potential founders for this opportunity
            </p>
          </CardContent>
        </Card>
      )}

      {founders.length > 0 && (
        <div className="space-y-3">
          {founders.map((founder, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-[#2d1e50] bg-[#1a0f2e] hover:border-[#8b85f7]/30 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {founder.name}
                        <Badge className="text-xs">
                          {founder.match_score}% match
                        </Badge>
                      </CardTitle>
                      <p className="text-xs text-[#64748b] mt-1">
                        {founder.current_role}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-[#a0aec0]">
                    <p className="font-semibold text-white mb-1">Background:</p>
                    <p className="text-xs">{founder.background}</p>
                  </div>

                  {founder.why_match && (
                    <div className="text-sm text-[#a0aec0]">
                      <p className="font-semibold text-white mb-1">Why they're a match:</p>
                      <p className="text-xs">{founder.why_match}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 flex-1"
                      onClick={() => handleGenerateOutreach(founder)}
                      disabled={outreachMutation.isPending}
                    >
                      <Mail className="w-3 h-3" />
                      Generate Outreach
                    </Button>
                    {founder.linkedin_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => window.open(founder.linkedin_url, '_blank')}
                      >
                        <Linkedin className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!outreach} onOpenChange={() => {
        setOutreach(null);
        setSelectedFounder(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#8b85f7]" />
              Outreach Messages for {selectedFounder?.name}
            </DialogTitle>
          </DialogHeader>

          {outreach && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-[#8b85f7]">Email Subject</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(outreach.subject, 'subject')}
                  >
                    {copiedField === 'subject' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-sm">
                  {outreach.subject}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-[#8b85f7]">Email Body</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(outreach.email, 'email')}
                  >
                    {copiedField === 'email' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <Textarea
                  value={outreach.email}
                  readOnly
                  className="min-h-[200px] bg-white/5 text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-[#8b85f7]">LinkedIn Message</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(outreach.linkedin, 'linkedin')}
                  >
                    {copiedField === 'linkedin' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <Textarea
                  value={outreach.linkedin}
                  readOnly
                  className="min-h-[100px] bg-white/5 text-sm"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}