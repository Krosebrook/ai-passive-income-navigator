/**
 * Input validation schemas (Zod)
 * ──────────────────────────────
 * Centralised Zod schemas for all user-submitted data.
 * Import the schema you need and call `.parse()` (throws on error)
 * or `.safeParse()` (returns { success, data, error }) for graceful handling.
 *
 * Week 1, Task 3 – Input Validation & Sanitisation
 */
import { z } from 'zod';

// ── Portfolio Idea ───────────────────────────────────────────
export const PORTFOLIO_CATEGORIES = [
  'digital_products',
  'ai_services',
  'ecommerce',
  'affiliate',
  'education',
  'software',
  'investing',
  'marketplace',
  'automation',
  'rental',
];

export const PORTFOLIO_STATUSES = [
  'exploring',
  'planning',
  'in_progress',
  'launched',
  'paused',
];

export const PORTFOLIO_PRIORITIES = ['low', 'medium', 'high'];

export const portfolioIdeaSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be 200 characters or fewer'),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer')
    .optional()
    .default(''),
  category: z.enum(PORTFOLIO_CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  status: z.enum(PORTFOLIO_STATUSES, {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),
  priority: z.enum(PORTFOLIO_PRIORITIES, {
    errorMap: () => ({ message: 'Please select a valid priority' }),
  }),
  notes: z
    .string()
    .max(5000, 'Notes must be 5000 characters or fewer')
    .optional()
    .default(''),
});

// ── User Preferences ─────────────────────────────────────────
export const RISK_TOLERANCES = [
  'conservative',
  'moderate',
  'aggressive',
];

export const TIME_HORIZONS = [
  'short_term',
  'medium_term',
  'long_term',
];

export const DIVERSIFICATION_PREFERENCES = [
  'concentrated',
  'moderately_diversified',
  'highly_diversified',
];

export const userPreferencesSchema = z.object({
  risk_tolerance: z.enum(RISK_TOLERANCES, {
    errorMap: () => ({ message: 'Please select a valid risk tolerance' }),
  }),
  investment_size_min: z
    .number()
    .min(0, 'Minimum investment must be 0 or greater'),
  investment_size_max: z
    .number()
    .min(0, 'Maximum investment must be 0 or greater'),
  target_industries: z.array(z.string()).default([]),
  preferred_deal_structures: z.array(z.string()).default([]),
  target_return_percentage: z
    .number()
    .min(0, 'Target return must be 0 or greater')
    .max(1000, 'Target return must be 1000% or less'),
  time_horizon: z.enum(TIME_HORIZONS, {
    errorMap: () => ({ message: 'Please select a valid time horizon' }),
  }),
  diversification_preference: z.enum(DIVERSIFICATION_PREFERENCES, {
    errorMap: () => ({ message: 'Please select a valid diversification preference' }),
  }),
}).refine(
  (data) => data.investment_size_max >= data.investment_size_min,
  {
    message: 'Maximum investment must be greater than or equal to minimum investment',
    path: ['investment_size_max'],
  }
);

/**
 * Formats a ZodError into a human-readable string.
 * @param {import('zod').ZodError} zodError
 * @returns {string}
 */
export function formatZodError(zodError) {
  return zodError.errors.map((e) => e.message).join('. ');
}
