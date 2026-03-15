import { describe, it, expect } from 'vitest';
import {
  portfolioIdeaSchema,
  userPreferencesSchema,
  formatZodError,
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_STATUSES,
  PORTFOLIO_PRIORITIES,
} from './validations';

/**
 * Tests for lib/validations.js
 * Verifies Zod schema correctness for Portfolio and UserPreferences forms.
 */
describe('portfolioIdeaSchema', () => {
  const validIdea = {
    title: 'AI Newsletter',
    description: 'A weekly AI digest for founders.',
    category: 'digital_products',
    status: 'exploring',
    priority: 'medium',
    notes: '',
  };

  it('accepts a fully valid idea', () => {
    const result = portfolioIdeaSchema.safeParse(validIdea);
    expect(result.success).toBe(true);
  });

  it('accepts an idea without optional fields', () => {
    const { description, notes, ...minimal } = validIdea;
    const result = portfolioIdeaSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    expect(result.data.description).toBe('');
    expect(result.data.notes).toBe('');
  });

  it('rejects a title shorter than 3 characters', () => {
    const result = portfolioIdeaSchema.safeParse({ ...validIdea, title: 'AB' });
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toMatch(/at least 3/i);
  });

  it('rejects a title longer than 200 characters', () => {
    const result = portfolioIdeaSchema.safeParse({ ...validIdea, title: 'A'.repeat(201) });
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toMatch(/200 characters/i);
  });

  it('rejects a description longer than 2000 characters', () => {
    const result = portfolioIdeaSchema.safeParse({ ...validIdea, description: 'x'.repeat(2001) });
    expect(result.success).toBe(false);
  });

  it('rejects notes longer than 5000 characters', () => {
    const result = portfolioIdeaSchema.safeParse({ ...validIdea, notes: 'x'.repeat(5001) });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid category', () => {
    const result = portfolioIdeaSchema.safeParse({ ...validIdea, category: 'not_a_category' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid status', () => {
    const result = portfolioIdeaSchema.safeParse({ ...validIdea, status: 'done' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid priority', () => {
    const result = portfolioIdeaSchema.safeParse({ ...validIdea, priority: 'critical' });
    expect(result.success).toBe(false);
  });

  it('accepts all defined categories', () => {
    for (const category of PORTFOLIO_CATEGORIES) {
      const result = portfolioIdeaSchema.safeParse({ ...validIdea, category });
      expect(result.success, `category ${category} should be valid`).toBe(true);
    }
  });

  it('accepts all defined statuses', () => {
    for (const status of PORTFOLIO_STATUSES) {
      const result = portfolioIdeaSchema.safeParse({ ...validIdea, status });
      expect(result.success, `status ${status} should be valid`).toBe(true);
    }
  });

  it('accepts all defined priorities', () => {
    for (const priority of PORTFOLIO_PRIORITIES) {
      const result = portfolioIdeaSchema.safeParse({ ...validIdea, priority });
      expect(result.success, `priority ${priority} should be valid`).toBe(true);
    }
  });

  it('rejects missing title', () => {
    const { title, ...rest } = validIdea;
    const result = portfolioIdeaSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe('userPreferencesSchema', () => {
  const validPrefs = {
    risk_tolerance: 'moderate',
    investment_size_min: 5000,
    investment_size_max: 50000,
    target_industries: ['SaaS', 'E-commerce'],
    preferred_deal_structures: ['Equity Purchase'],
    target_return_percentage: 20,
    time_horizon: 'medium_term',
    diversification_preference: 'moderately_diversified',
  };

  it('accepts valid preferences', () => {
    const result = userPreferencesSchema.safeParse(validPrefs);
    expect(result.success).toBe(true);
  });

  it('accepts empty arrays for industries and deal structures', () => {
    const result = userPreferencesSchema.safeParse({
      ...validPrefs,
      target_industries: [],
      preferred_deal_structures: [],
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid risk_tolerance', () => {
    const result = userPreferencesSchema.safeParse({ ...validPrefs, risk_tolerance: 'reckless' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid time_horizon', () => {
    const result = userPreferencesSchema.safeParse({ ...validPrefs, time_horizon: 'forever' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid diversification_preference', () => {
    const result = userPreferencesSchema.safeParse({ ...validPrefs, diversification_preference: 'yolo' });
    expect(result.success).toBe(false);
  });

  it('rejects negative investment sizes', () => {
    const result = userPreferencesSchema.safeParse({ ...validPrefs, investment_size_min: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects max investment less than min', () => {
    const result = userPreferencesSchema.safeParse({
      ...validPrefs,
      investment_size_min: 10000,
      investment_size_max: 5000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects return percentage above 1000', () => {
    const result = userPreferencesSchema.safeParse({ ...validPrefs, target_return_percentage: 1001 });
    expect(result.success).toBe(false);
  });

  it('accepts return percentage of exactly 1000', () => {
    const result = userPreferencesSchema.safeParse({ ...validPrefs, target_return_percentage: 1000 });
    expect(result.success).toBe(true);
  });
});

describe('formatZodError', () => {
  it('returns a human-readable string for validation errors', () => {
    const result = portfolioIdeaSchema.safeParse({ title: 'AB', category: 'bad' });
    expect(result.success).toBe(false);
    const message = formatZodError(result.error);
    expect(typeof message).toBe('string');
    expect(message.length).toBeGreaterThan(0);
  });

  it('joins multiple errors with a period and space', () => {
    const result = portfolioIdeaSchema.safeParse({});
    expect(result.success).toBe(false);
    const message = formatZodError(result.error);
    // Multiple errors → joined with '. '
    expect(message).toContain('.');
  });
});
