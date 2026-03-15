import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Sparkles, Globe, Loader2, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import AIFieldInput from '@/components/ai/AIFieldInput';

export default function SmartAddDealModal({ open, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    deal_name: '',
    deal_description: '',
    industry: '',
    stage: 'research',
    priority: 'medium',
    estimated_value: '',
    expected_close_date: '',
    notes: ''
  });
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [enriching, setEnriching] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState(null);
  const [saving, setSaving] = useState(false);

  const aiContext = {
    deal_name: formData.deal_name,
    industry: formData.industry,
    stage: formData.stage
  };

  const handleEnrich = async () => {
    const query = scrapeUrl || formData.deal_name;
    if (!query) { toast.error('Enter a deal name or URL to enrich'); return; }
    setEnriching(true);
    try {
      const res = await base44.functions.invoke('scrapeAndEnrichDeal', {
        query,
        url: scrapeUrl || undefined
      });
      const e = res.data?.enrichment;
      if (e) {
        setEnrichmentData(e);
        if (e.recommended_description && !formData.deal_description) {
          setFormData(f => ({ ...f, deal_description: e.recommended_description }));
        }
        if (e.recommended_industry && !formData.industry) {
          setFormData(f => ({ ...f, industry: e.recommended_industry }));
        }
        if (e.estimated_value_range?.low && !formData.estimated_value) {
          setFormData(f => ({ ...f, estimated_value: String(e.estimated_value_range.low) }));
        }
        toast.success('Deal enriched with real market data!');
      }
    } catch (e) {
      toast.error('Enrichment failed');
    }
    setEnriching(false);
  };

  const handleSubmit = async () => {
    if (!formData.deal_name) { toast.error('Deal name required'); return; }
    setSaving(true);
    try {
      await base44.entities.DealPipeline.create({
        ...formData,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : 0,
        industry: formData.industry || undefined,
        enrichment_data: enrichmentData || undefined,
        stage_history: [{ stage: formData.stage, entered_at: new Date().toISOString(), notes: 'Deal created' }]
      });
      queryClient.invalidateQueries({ queryKey: ['deal-pipeline'] });
      toast.success('Deal added! Auto due diligence is running in background...');
      onClose();
      resetForm();
    } catch (err) {
      toast.error('Failed to add deal');
    }
    setSaving(false);
  };

  const resetForm = () => {
    setFormData({ deal_name: '', deal_description: '', industry: '', stage: 'research', priority: 'medium', estimated_value: '', expected_close_date: '', notes: '' });
    setScrapeUrl('');
    setEnrichmentData(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1a0f2e] border border-[#2d1e50]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Zap className="w-5 h-5 text-[#8b85f7]" />
            Add Deal
            <Badge className="bg-[#8b85f7]/20 text-[#8b85f7] border-[#8b85f7]/40 text-xs ml-1">AI-Assisted</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* URL Enrichment Banner */}
          <div className="p-3 rounded-xl bg-[#0f0618] border border-[#8b85f7]/30">
            <p className="text-xs text-[#8b85f7] font-semibold mb-2 flex items-center gap-1">
              <Globe className="w-3 h-3" /> Paste a URL or company name to auto-fill from the web
            </p>
            <div className="flex gap-2">
              <input
                value={scrapeUrl}
                onChange={e => setScrapeUrl(e.target.value)}
                placeholder="https://company.com or search query..."
                className="flex-1 bg-[#1a0f2e] border border-[#2d1e50] text-white text-sm rounded-lg px-3 py-2 focus:border-[#8b85f7] focus:outline-none"
              />
              <Button
                size="sm"
                onClick={handleEnrich}
                disabled={enriching}
                className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0] text-white"
              >
                {enriching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {enriching ? 'Enriching...' : 'Enrich'}
              </Button>
            </div>
          </div>

          {/* Enrichment Preview */}
          {enrichmentData && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 space-y-2">
              <p className="text-xs font-semibold text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Auto-filled from live web data
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {enrichmentData.market_size && (
                  <div><span className="text-[#64748b]">Market:</span> <span className="text-white">{enrichmentData.market_size}</span></div>
                )}
                {enrichmentData.growth_rate && (
                  <div><span className="text-[#64748b]">Growth:</span> <span className="text-[#8b85f7]">{enrichmentData.growth_rate}</span></div>
                )}
              </div>
              {enrichmentData.investment_thesis && (
                <p className="text-xs text-[#94a3b8] italic">"{enrichmentData.investment_thesis}"</p>
              )}
              {enrichmentData.key_risks?.length > 0 && (
                <div className="flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-400">{enrichmentData.key_risks[0]}</p>
                </div>
              )}
            </div>
          )}

          {/* Deal Name - AI assisted */}
          <AIFieldInput
            field="deal_name"
            label="Deal Name *"
            value={formData.deal_name}
            onChange={v => setFormData(f => ({ ...f, deal_name: v }))}
            placeholder="e.g., AI SaaS for Healthcare Ops"
            context={aiContext}
            formType="deal"
          />

          {/* Industry - AI assisted */}
          <AIFieldInput
            field="industry"
            label="Industry / Sector"
            value={formData.industry}
            onChange={v => setFormData(f => ({ ...f, industry: v }))}
            placeholder="e.g., B2B SaaS - Healthcare"
            context={aiContext}
            formType="deal"
          />

          {/* Description - AI assisted, multiline */}
          <AIFieldInput
            field="deal_description"
            label="Description"
            value={formData.deal_description}
            onChange={v => setFormData(f => ({ ...f, deal_description: v }))}
            placeholder="Describe the opportunity, business model, revenue streams..."
            context={aiContext}
            formType="deal"
            multiline={true}
          />

          {/* Notes - AI assisted */}
          <AIFieldInput
            field="notes"
            label="Notes / Due Diligence Flags"
            value={formData.notes}
            onChange={v => setFormData(f => ({ ...f, notes: v }))}
            placeholder="Key observations, risks, next steps..."
            context={aiContext}
            formType="deal"
            multiline={true}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-[#94a3b8] mb-1">Stage</Label>
              <Select value={formData.stage} onValueChange={v => setFormData(f => ({ ...f, stage: v }))}>
                <SelectTrigger className="bg-[#0f0618] border-[#2d1e50] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a0f2e] border-[#2d1e50]">
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="launch">Launch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-[#94a3b8] mb-1">Priority</Label>
              <Select value={formData.priority} onValueChange={v => setFormData(f => ({ ...f, priority: v }))}>
                <SelectTrigger className="bg-[#0f0618] border-[#2d1e50] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a0f2e] border-[#2d1e50]">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-[#94a3b8] mb-1">Estimated Value ($)</Label>
              <Input
                type="number"
                value={formData.estimated_value}
                onChange={e => setFormData(f => ({ ...f, estimated_value: e.target.value }))}
                placeholder="0"
                className="bg-[#0f0618] border-[#2d1e50] text-white"
              />
            </div>
            <div>
              <Label className="text-xs text-[#94a3b8] mb-1">Expected Close</Label>
              <Input
                type="date"
                value={formData.expected_close_date}
                onChange={e => setFormData(f => ({ ...f, expected_close_date: e.target.value }))}
                className="bg-[#0f0618] border-[#2d1e50] text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSubmit} disabled={saving} className="flex-1 bg-gradient-to-r from-[#8b85f7] to-[#583cf0]">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
              {saving ? 'Adding...' : 'Add Deal + Run Auto DD'}
            </Button>
            <Button variant="ghost" onClick={onClose} className="text-[#64748b]">Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}