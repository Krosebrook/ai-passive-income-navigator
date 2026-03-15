/**
 * AI Suggestion Engine
 * -------------------
 * Wraps any form field and injects AI suggestion capabilities.
 * Usage:
 *   <SuggestionContainer fieldKey="deal_summary" context={{ industry: "SaaS" }}>
 *     {({ onAccept, suggestion }) => (
 *       <textarea value={value} onChange={...} />
 *     )}
 *   </SuggestionContainer>
 *
 * Or simpler shorthand for text fields:
 *   <AISuggestedInput fieldKey="deal_title" label="Deal Title" ... />
 */

import React, { useState, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, RefreshCw, Check, X, ChevronLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────
// 1.  CLIENT-SIDE SUGGESTION CACHE
//     Keyed by fieldKey + JSON(context)
//     Avoids redundant API calls within
//     the same browser session.
// ─────────────────────────────────────────
const suggestionCache = new Map();   // key → { suggestions[], fetchedAt }
const CACHE_TTL = 5 * 60 * 1000;    // 5 minutes

function getCacheKey(fieldKey, context) {
  return `${fieldKey}::${JSON.stringify(context ?? {})}`;
}

function getCached(fieldKey, context) {
  const key = getCacheKey(fieldKey, context);
  const entry = suggestionCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_TTL) {
    suggestionCache.delete(key);
    return null;
  }
  return entry.suggestions;
}

function setCache(fieldKey, context, suggestions) {
  suggestionCache.set(getCacheKey(fieldKey, context), {
    suggestions,
    fetchedAt: Date.now(),
  });
}

// ─────────────────────────────────────────
// 2.  HOOK: useSuggestions
//     Encapsulates all suggestion state,
//     rotation logic, and API calls.
// ─────────────────────────────────────────
export function useSuggestions({ fieldKey, context, config }) {
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [suggestions, setSuggestions] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [history, setHistory] = useState([]);   // accepted suggestions user has seen
  const abortRef = useRef(null);

  const currentSuggestion = suggestions[historyIndex] ?? null;

  // ── Fetch from backend (or cache) ──────
  const fetchSuggestions = useCallback(async (force = false) => {
    if (!force) {
      const cached = getCached(fieldKey, context);
      if (cached) {
        setSuggestions(cached);
        setHistoryIndex(0);
        setStatus('ready');
        return;
      }
    }

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setStatus('loading');
    try {
      const response = await base44.functions.invoke('getAISuggestions', {
        fieldKey,
        context: context ?? {},
        config: config ?? {},
        count: 3,          // fetch 3 at once for client-side rotation
      });

      const fresh = response.data?.suggestions ?? [];
      setSuggestions(fresh);
      setHistoryIndex(0);
      setCache(fieldKey, context, fresh);
      setStatus(fresh.length > 0 ? 'ready' : 'idle');
    } catch (err) {
      if (err.name !== 'AbortError') {
        setStatus('error');
      }
    }
  }, [fieldKey, context, config]);

  // ── Rotation ────────────────────────────
  // Client-side: cycles through the 3 pre-fetched suggestions.
  // When exhausted, silently fetches a new batch in the background.
  const rotate = useCallback(async () => {
    if (historyIndex < suggestions.length - 1) {
      setHistoryIndex(i => i + 1);
    } else {
      // Exhausted local batch → refetch
      await fetchSuggestions(true);
    }
  }, [historyIndex, suggestions.length, fetchSuggestions]);

  const rotatePrev = useCallback(() => {
    setHistoryIndex(i => Math.max(0, i - 1));
  }, []);

  // ── Accept ──────────────────────────────
  const accept = useCallback((text) => {
    setHistory(h => [{ text, timestamp: Date.now() }, ...h.slice(0, 9)]);
    setStatus('idle');
    setSuggestions([]);
  }, []);

  // ── Discard ─────────────────────────────
  const discard = useCallback(() => {
    setStatus('idle');
    setSuggestions([]);
  }, []);

  return {
    status,
    currentSuggestion,
    suggestions,
    historyIndex,
    history,
    totalSuggestions: suggestions.length,
    fetchSuggestions,
    rotate,
    rotatePrev,
    accept,
    discard,
    hasPrev: historyIndex > 0,
    hasNext: historyIndex < suggestions.length - 1,
  };
}

// ─────────────────────────────────────────
// 3.  SUGGESTION PILL
//     Inline display of the current
//     suggestion with accept/rotate/discard
// ─────────────────────────────────────────
function SuggestionPill({ suggestion, status, hasPrev, hasNext, historyIndex, totalSuggestions, onAccept, onRotate, onRotatePrev, onDiscard, onFetch }) {
  if (status === 'idle') {
    return (
      <button
        type="button"
        onClick={onFetch}
        className="inline-flex items-center gap-1.5 text-xs text-[#8b85f7] hover:text-[#a89eff] transition-colors mt-1"
      >
        <Sparkles className="w-3 h-3" />
        AI suggestion
      </button>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-[#1a0f2e] border border-[#2d1e50]">
        <Loader2 className="w-3 h-3 text-[#8b85f7] animate-spin" />
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="h-2 rounded bg-[#2d1e50] animate-pulse"
              style={{ width: `${40 + i * 20}px`, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
        <X className="w-3 h-3" />
        Couldn't generate suggestion.
        <button type="button" onClick={onFetch} className="underline hover:no-underline">Retry</button>
      </div>
    );
  }

  if (status === 'ready' && suggestion) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={suggestion}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="mt-2 px-3 py-2 rounded-lg bg-[#1a0f2e] border border-[#8b85f7]/30 text-xs text-[#c4b5fd] leading-relaxed group"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <Sparkles className="w-3 h-3 text-[#8b85f7] mt-0.5 flex-shrink-0" />
              <span className="break-words">{suggestion}</span>
            </div>
            {/* Controls */}
            <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
              {hasPrev && (
                <button type="button" onClick={onRotatePrev}
                  className="p-0.5 rounded hover:bg-[#2d1e50] text-[#64748b] hover:text-white transition-colors"
                  title="Previous suggestion">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}
              <button type="button" onClick={onRotate}
                className="p-0.5 rounded hover:bg-[#2d1e50] text-[#64748b] hover:text-[#8b85f7] transition-colors"
                title="Next suggestion (⌘↩)">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => onAccept(suggestion)}
                className="p-0.5 rounded hover:bg-emerald-900/40 text-[#64748b] hover:text-emerald-400 transition-colors"
                title="Accept (Tab)">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={onDiscard}
                className="p-0.5 rounded hover:bg-red-900/30 text-[#64748b] hover:text-red-400 transition-colors"
                title="Dismiss">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pagination dots */}
          {totalSuggestions > 1 && (
            <div className="flex gap-1 mt-1.5 justify-center">
              {Array.from({ length: totalSuggestions }).map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full transition-colors ${i === historyIndex ? 'bg-[#8b85f7]' : 'bg-[#2d1e50]'}`} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}

// ─────────────────────────────────────────
// 4.  SUGGESTION CONTAINER
//     The main wrapper component.
//     Accepts children as a render prop
//     or a plain element.
// ─────────────────────────────────────────
export function SuggestionContainer({ fieldKey, context, config, onAccept, children }) {
  const engine = useSuggestions({ fieldKey, context, config });

  // Keyboard shortcuts on the container
  const handleKeyDown = useCallback((e) => {
    if (engine.status !== 'ready') return;
    // Tab → accept
    if (e.key === 'Tab' && engine.currentSuggestion) {
      e.preventDefault();
      onAccept?.(engine.currentSuggestion);
      engine.accept(engine.currentSuggestion);
    }
    // Cmd/Ctrl + Enter → rotate
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      engine.rotate();
    }
  }, [engine, onAccept]);

  const handleAccept = (text) => {
    onAccept?.(text);
    engine.accept(text);
  };

  return (
    <div onKeyDown={handleKeyDown}>
      {typeof children === 'function'
        ? children({ suggestion: engine.currentSuggestion, engine })
        : children
      }
      <SuggestionPill
        suggestion={engine.currentSuggestion}
        status={engine.status}
        hasPrev={engine.hasPrev}
        hasNext={engine.hasNext}
        historyIndex={engine.historyIndex}
        totalSuggestions={engine.totalSuggestions}
        onAccept={handleAccept}
        onRotate={engine.rotate}
        onRotatePrev={engine.rotatePrev}
        onDiscard={engine.discard}
        onFetch={engine.fetchSuggestions}
      />
    </div>
  );
}

// ─────────────────────────────────────────
// 5.  SHORTHAND: AISuggestedInput
//     Drop-in replacement for <input> or
//     <textarea> with built-in AI pill.
// ─────────────────────────────────────────
export function AISuggestedInput({
  fieldKey, context, config,
  label, value, onChange,
  multiline = false,
  className = '',
  placeholder = '',
  ...props
}) {
  const engine = useSuggestions({ fieldKey, context, config });

  const handleAccept = (text) => {
    onChange?.({ target: { value: text } });
    engine.accept(text);
  };

  const handleKeyDown = (e) => {
    if (engine.status === 'ready' && e.key === 'Tab' && engine.currentSuggestion) {
      e.preventDefault();
      handleAccept(engine.currentSuggestion);
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      engine.rotate();
    }
  };

  const inputClass = `w-full bg-[#1a0f2e] border border-[#2d1e50] text-white rounded-lg px-3 py-2
    focus:border-[#8b85f7] focus:outline-none focus:ring-2 focus:ring-[#8b85f7]/20
    transition-all placeholder:text-[#64748b] text-sm ${className}`;

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-[#94a3b8]">{label}</label>
          <button
            type="button"
            onClick={() => engine.fetchSuggestions()}
            className="inline-flex items-center gap-1 text-xs text-[#8b85f7] hover:text-[#a89eff] transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Suggest
          </button>
        </div>
      )}

      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${inputClass} resize-none`}
          {...props}
        />
      ) : (
        <input
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClass}
          {...props}
        />
      )}

      <SuggestionPill
        suggestion={engine.currentSuggestion}
        status={engine.status}
        hasPrev={engine.hasPrev}
        hasNext={engine.hasNext}
        historyIndex={engine.historyIndex}
        totalSuggestions={engine.totalSuggestions}
        onAccept={handleAccept}
        onRotate={engine.rotate}
        onRotatePrev={engine.rotatePrev}
        onDiscard={engine.discard}
        onFetch={engine.fetchSuggestions}
      />
    </div>
  );
}

export default SuggestionContainer;