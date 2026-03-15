import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, ChevronDown, Loader2, Check, X } from 'lucide-react';

/**
 * Drop-in replacement for Input/Textarea with AI suggestions.
 * On focus or after typing 2+ chars, fetches top 5 AI suggestions.
 * Renders a floating suggestion dropdown.
 */
export function AIFieldInput({
  field,
  value,
  onChange,
  context = {},
  formType = 'deal',
  placeholder,
  multiline = false,
  className = '',
  label,
  debounceMs = 800,
  ...props
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [insight, setInsight] = useState('');
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = async (inputVal) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('aiFieldAssist', {
        field,
        value: inputVal,
        context,
        form_type: formType
      });
      if (res.data?.suggestions?.length) {
        setSuggestions(res.data.suggestions);
        setInsight(res.data.context_insight || '');
        setOpen(true);
      }
    } catch (_) { /* silent */ }
    setLoading(false);
  };

  const handleChange = (e) => {
    const v = e.target.value;
    onChange(v);
    clearTimeout(debounceRef.current);
    if (v.length >= 2) {
      debounceRef.current = setTimeout(() => fetchSuggestions(v), debounceMs);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  };

  const handleAccept = (suggestion) => {
    onChange(suggestion.value);
    setOpen(false);
    setSuggestions([]);
  };

  const triggerSuggestions = () => {
    if (suggestions.length > 0) {
      setOpen(true);
    } else {
      fetchSuggestions(value || '');
    }
  };

  const baseClass = `w-full bg-[#1a0f2e] border border-[#2d1e50] text-white rounded-lg px-3 py-2 focus:border-[#8b85f7] focus:outline-none focus:ring-2 focus:ring-[#8b85f7]/20 transition-all text-sm ${className}`;

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-[#94a3b8]">{label}</label>
          <button
            type="button"
            onClick={triggerSuggestions}
            className="flex items-center gap-1 text-xs text-[#8b85f7] hover:text-[#a89eff] transition-colors"
            title="Get AI suggestions"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            AI Suggestions
          </button>
        </div>
      )}

      <div className="relative">
        {multiline ? (
          <textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={`${baseClass} resize-none`}
            rows={3}
            {...props}
          />
        ) : (
          <input
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={baseClass}
            {...props}
          />
        )}

        {/* Sparkle trigger button */}
        <button
          type="button"
          onClick={triggerSuggestions}
          className={`absolute right-2 ${multiline ? 'top-2' : 'top-1/2 -translate-y-1/2'} p-1 rounded hover:bg-[#8b85f7]/20 transition-colors group`}
          title="AI suggestions"
        >
          {loading
            ? <Loader2 className="w-3.5 h-3.5 text-[#8b85f7] animate-spin" />
            : <Sparkles className="w-3.5 h-3.5 text-[#2d1e50] group-hover:text-[#8b85f7] transition-colors" />
          }
        </button>
      </div>

      {/* Suggestion Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#1a0f2e] border border-[#8b85f7]/40 rounded-xl shadow-2xl shadow-[#8b85f7]/20 overflow-hidden">
          {insight && (
            <div className="px-3 py-2 bg-[#8b85f7]/10 border-b border-[#2d1e50]">
              <p className="text-xs text-[#8b85f7] italic">{insight}</p>
            </div>
          )}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2d1e50]">
            <span className="text-xs text-[#64748b] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#8b85f7]" /> Top 5 AI Suggestions
            </span>
            <button onClick={() => setOpen(false)} className="text-[#64748b] hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2.5 hover:bg-[#2d1e50] transition-colors border-b border-[#2d1e50]/50 last:border-0 group"
                  onClick={() => handleAccept(s)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate group-hover:text-[#8b85f7] transition-colors">
                        {s.label || s.value}
                      </p>
                      {s.reasoning && (
                        <p className="text-xs text-[#64748b] mt-0.5 line-clamp-2">{s.reasoning}</p>
                      )}
                      {s.source && (
                        <p className="text-xs text-[#8b85f7]/60 mt-0.5">📡 {s.source}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {s.confidence && (
                        <span className="text-xs text-[#64748b]">{Math.round(s.confidence * 100)}%</span>
                      )}
                      <Check className="w-3.5 h-3.5 text-[#8b85f7] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="px-3 py-2 bg-[#0f0618]/50 border-t border-[#2d1e50]">
            <p className="text-xs text-[#2d1e50]">Click a suggestion to apply · AI-powered by real market data</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIFieldInput;