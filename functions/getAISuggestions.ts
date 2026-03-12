/**
 * getAISuggestions — Backend suggestion engine
 * ─────────────────────────────────────────────
 * POST payload:
 *   fieldKey  : string          — identifies the field (e.g. "deal_summary")
 *   context   : object          — surrounding data (e.g. { industry, title })
 *   config    : object          — per-field config (prompt template, tone, etc.)
 *   count     : number          — how many suggestions to return (default 3)
 *
 * Returns:
 *   { suggestions: string[], model, cached: bool }
 *
 * ── Rate limiting ──────────────────────────────
 *   Simple in-memory per-user rate limit.
 *   For production, swap with Redis or a KV store.
 *
 * ── Caching ────────────────────────────────────
 *   Server-side cache keyed by fieldKey+context hash.
 *   Avoids burning API tokens for identical requests
 *   across different users.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ── Server-side cache (in-process, resets on cold start) ──
const serverCache = new Map();
const SERVER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// ── In-memory rate limiter ─────────────────────────────────
const rateLimiter = new Map(); // userEmail → { count, windowStart }
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX    = 20;         // 20 suggestions/min per user

function checkRateLimit(userEmail) {
  const now = Date.now();
  const entry = rateLimiter.get(userEmail) ?? { count: 0, windowStart: now };
  if (now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimiter.set(userEmail, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  rateLimiter.set(userEmail, entry);
  return true;
}

// ── Simple hash for cache keys ─────────────────────────────
function hashObject(obj) {
  return JSON.stringify(obj).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0).toString(36);
}

// ─────────────────────────────────────────────────────────────
// PROMPT TEMPLATES
// Each fieldKey maps to a template function that receives
// the context object and returns a system + user prompt pair.
// This is the "prompt engineering" layer — add new field types
// here without touching any other code.
// ─────────────────────────────────────────────────────────────
const PROMPT_TEMPLATES = {
  // Deal fields
  deal_summary: (ctx) => ({
    system: 'You are an expert investment analyst. Write concise, compelling deal summaries for investors. Always respond with valid JSON.',
    user: `Generate ${ctx._count} distinct one-paragraph deal summaries for a ${ctx.industry ?? 'technology'} opportunity${ctx.title ? ` called "${ctx.title}"` : ''}. 
           Tone: professional, data-driven, opportunity-focused.
           Respond with JSON: {"suggestions": ["summary1", "summary2", "summary3"]}`,
  }),
  deal_title: (ctx) => ({
    system: 'You are a deal naming expert. Create clear, compelling investment opportunity titles. Always respond with valid JSON.',
    user: `Generate ${ctx._count} distinct deal titles for a ${ctx.industry ?? 'business'} investment opportunity.
           ${ctx.summary ? `Context: ${ctx.summary}` : ''}
           Respond with JSON: {"suggestions": ["title1", "title2", "title3"]}`,
  }),
  deal_how_to_pursue: (ctx) => ({
    system: 'You are a seasoned deal sourcer with deep M&A experience. Always respond with valid JSON.',
    user: `Write ${ctx._count} distinct action plans for pursuing a ${ctx.industry ?? 'business'} deal.
           ${ctx.title ? `Deal: ${ctx.title}` : ''}
           Each 2-3 sentences covering first contact, due diligence, and closing.
           Respond with JSON: {"suggestions": ["plan1", "plan2", "plan3"]}`,
  }),
  // Portfolio / idea fields
  idea_description: (ctx) => ({
    system: 'You are a business development expert helping investors craft passive income ideas. Always respond with valid JSON.',
    user: `Generate ${ctx._count} compelling descriptions for a ${ctx.category ?? 'business'} passive income idea.
           ${ctx.name ? `Idea name: ${ctx.name}` : ''}
           Each 2-3 sentences, focus on scalability and ROI potential.
           Respond with JSON: {"suggestions": ["desc1", "desc2", "desc3"]}`,
  }),
  goal_name: (ctx) => ({
    system: 'You help investors set clear, motivating financial goals. Always respond with valid JSON.',
    user: `Suggest ${ctx._count} specific financial goal names for someone with ${ctx.risk_tolerance ?? 'moderate'} risk tolerance targeting ${ctx.target_return ?? 20}% returns.
           Respond with JSON: {"suggestions": ["goal1", "goal2", "goal3"]}`,
  }),
  // Generic fallback for unregistered fields
  _default: (ctx) => ({
    system: 'You are a helpful AI assistant generating form field suggestions. Always respond with valid JSON.',
    user: `Generate ${ctx._count} helpful suggestions for a form field labeled "${ctx._fieldKey}".
           ${ctx._label ? `Field description: ${ctx._label}` : ''}
           Context: ${JSON.stringify(ctx)}
           Respond with JSON: {"suggestions": ["suggestion1", "suggestion2", "suggestion3"]}`,
  }),
};

// ─────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit check
    if (!checkRateLimit(user.email)) {
      return Response.json(
        { error: 'Rate limit exceeded. Please wait a moment.', retry_after: 60 },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { fieldKey, context = {}, config = {}, count = 3 } = body;

    if (!fieldKey) {
      return Response.json({ error: 'fieldKey is required' }, { status: 400 });
    }

    // ── Server cache check ─────────────────
    const cacheKey = `${fieldKey}::${hashObject(context)}::${count}`;
    const cached = serverCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < SERVER_CACHE_TTL) {
      return Response.json({ suggestions: cached.suggestions, cached: true });
    }

    // ── Build prompt ───────────────────────
    const templateFn = PROMPT_TEMPLATES[fieldKey] ?? PROMPT_TEMPLATES._default;
    const enrichedContext = { ...context, _count: count, _fieldKey: fieldKey, _label: config.label };
    const { system, user: userPrompt } = templateFn(enrichedContext);

    // ── Call OpenAI ────────────────────────
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model ?? 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userPrompt },
        ],
        temperature: config.temperature ?? 0.8,
        max_tokens: config.max_tokens ?? 600,
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiRes.ok) {
      const err = await aiRes.json();
      throw new Error(err.error?.message ?? 'OpenAI error');
    }

    const aiData = await aiRes.json();
    const raw = aiData.choices[0].message.content;

    // Parse — handle both array-wrapped and object-wrapped JSON
    let parsed;
    try {
      const obj = JSON.parse(raw);
      // Accept { suggestions: [] } or just []
      parsed = Array.isArray(obj) ? obj : (obj.suggestions ?? obj.items ?? Object.values(obj));
    } catch {
      // Fallback: extract quoted strings
      parsed = [...raw.matchAll(/"([^"]+)"/g)].map(m => m[1]).filter(Boolean);
    }

    const suggestions = parsed.slice(0, count).filter(s => typeof s === 'string' && s.trim());

    // Cache the result server-side
    serverCache.set(cacheKey, { suggestions, fetchedAt: Date.now() });

    // Optional: track usage in base44 for analytics
    // await base44.asServiceRole.entities.SuggestionLog.create({ ... })

    return Response.json({ suggestions, cached: false, model: config.model ?? 'gpt-4o-mini' });

  } catch (error) {
    return Response.json({ error: error.message, suggestions: [] }, { status: 500 });
  }
});