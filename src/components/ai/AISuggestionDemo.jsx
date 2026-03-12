/**
 * AISuggestionDemo
 * ─────────────────
 * Demonstrates the SuggestionEngine across
 * multiple field types and configuration patterns.
 *
 * Drop this into any page to showcase the system:
 *   import AISuggestionDemo from '@/components/ai/AISuggestionDemo';
 */

import React, { useState } from 'react';
import { AISuggestedInput, SuggestionContainer } from '@/components/ai/SuggestionEngine';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Code2, FileText, Settings, Lightbulb } from 'lucide-react';

// ── Schema-driven field config ─────────────────
// This is the "configuration rather than code" approach:
// each field declares its AI metadata in a simple object.
// Forms can be defined as config arrays and rendered generically.
const FIELD_CONFIGS = {
  deal_title: {
    label: 'Deal Title',
    placeholder: 'e.g. SaaS Micro-Acquisition Opportunity',
    promptKey: 'deal_title',
    temperature: 0.9,
  },
  deal_summary: {
    label: 'Deal Summary',
    placeholder: 'Brief overview of the investment opportunity...',
    promptKey: 'deal_summary',
    multiline: true,
    rows: 3,
    temperature: 0.75,
  },
  deal_how_to_pursue: {
    label: 'How to Pursue',
    placeholder: 'Steps to move this deal forward...',
    promptKey: 'deal_how_to_pursue',
    multiline: true,
    rows: 4,
    temperature: 0.7,
  },
};

export default function AISuggestionDemo() {
  const [industry, setIndustry] = useState('SaaS');
  const [fields, setFields] = useState({
    deal_title: '',
    deal_summary: '',
    deal_how_to_pursue: '',
    deal_structure: '',
  });

  const set = (key) => (e) => setFields(f => ({ ...f, [key]: e.target.value ?? e }));
  const accept = (key) => (value) => setFields(f => ({ ...f, [key]: value }));

  // The context object is passed to every field so the AI has
  // awareness of sibling fields — essential for coherent suggestions.
  const sharedContext = {
    industry,
    title: fields.deal_title,
    summary: fields.deal_summary,
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-[#8b85f7]" />
          <h2 className="text-lg font-semibold text-white">AI Suggestion Engine Demo</h2>
        </div>
        <p className="text-sm text-[#64748b]">
          Click "Suggest" or press <kbd className="px-1 py-0.5 rounded bg-[#2d1e50] text-[#8b85f7] text-xs font-mono">Tab</kbd> to accept · 
          <kbd className="px-1 py-0.5 rounded bg-[#2d1e50] text-[#8b85f7] text-xs font-mono mx-1">⌘↩</kbd> to rotate
        </p>
      </div>

      {/* Industry selector (affects all AI context) */}
      <div>
        <label className="text-sm font-medium text-[#94a3b8] block mb-1.5">Industry Context</label>
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger className="bg-[#1a0f2e] border-[#2d1e50] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['SaaS', 'E-commerce', 'Real Estate', 'FinTech', 'Healthcare', 'Media'].map(i => (
              <SelectItem key={i} value={i}>{i}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-[#64748b] mt-1">Changing industry instantly updates AI context for all fields below.</p>
      </div>

      <hr className="border-[#2d1e50]" />

      {/* ── Pattern 1: AISuggestedInput shorthand ──────────── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-[#00b7eb]" />
          <span className="text-sm font-semibold text-[#94a3b8]">Pattern 1 — AISuggestedInput (shorthand)</span>
        </div>
        <AISuggestedInput
          fieldKey="deal_title"
          context={sharedContext}
          config={FIELD_CONFIGS.deal_title}
          label="Deal Title"
          placeholder={FIELD_CONFIGS.deal_title.placeholder}
          value={fields.deal_title}
          onChange={set('deal_title')}
          onAccept={accept('deal_title')}
        />
      </section>

      {/* ── Pattern 2: Multiline textarea ─────────────────── */}
      <section>
        <AISuggestedInput
          fieldKey="deal_summary"
          context={sharedContext}
          config={FIELD_CONFIGS.deal_summary}
          label="Deal Summary"
          placeholder={FIELD_CONFIGS.deal_summary.placeholder}
          value={fields.deal_summary}
          onChange={set('deal_summary')}
          onAccept={accept('deal_summary')}
          multiline
          rows={3}
        />
      </section>

      {/* ── Pattern 3: SuggestionContainer wrapping a custom select ─── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-[#ff8e42]" />
          <span className="text-sm font-semibold text-[#94a3b8]">Pattern 3 — SuggestionContainer (render-prop, wraps any element)</span>
        </div>
        <label className="text-sm font-medium text-[#94a3b8] block mb-1.5">Deal Structure</label>
        <SuggestionContainer
          fieldKey="deal_structure"
          context={sharedContext}
          onAccept={accept('deal_structure')}
        >
          <Select value={fields.deal_structure} onValueChange={(v) => setFields(f => ({ ...f, deal_structure: v }))}>
            <SelectTrigger className="bg-[#1a0f2e] border-[#2d1e50] text-white w-full">
              <SelectValue placeholder="Select deal structure..." />
            </SelectTrigger>
            <SelectContent>
              {['Equity', 'Revenue Share', 'Licensing', 'Debt', 'Hybrid'].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SuggestionContainer>
        <p className="text-xs text-[#64748b] mt-1">
          Suggestion appears below — accepting it sets the value in state.
        </p>
      </section>

      {/* ── Pattern 4: How to pursue (long-form) ────────── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-[#8b85f7]" />
          <span className="text-sm font-semibold text-[#94a3b8]">Pattern 4 — Long-form with context propagation</span>
        </div>
        <AISuggestedInput
          fieldKey="deal_how_to_pursue"
          context={sharedContext}
          config={FIELD_CONFIGS.deal_how_to_pursue}
          label="How to Pursue This Deal"
          placeholder={FIELD_CONFIGS.deal_how_to_pursue.placeholder}
          value={fields.deal_how_to_pursue}
          onChange={set('deal_how_to_pursue')}
          onAccept={accept('deal_how_to_pursue')}
          multiline
          rows={4}
        />
      </section>

      {/* Result preview */}
      {Object.values(fields).some(Boolean) && (
        <section className="rounded-xl bg-[#1a0f2e] border border-[#2d1e50] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Code2 className="w-4 h-4 text-[#64748b]" />
            <span className="text-xs font-mono text-[#64748b]">Current field state</span>
          </div>
          <pre className="text-xs text-[#a0aec0] whitespace-pre-wrap break-words">
            {JSON.stringify(fields, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}