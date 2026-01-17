import { z } from 'zod';

export const portfolioIdeaSchema = z.object({
  title: z.string().min(3).max(200),
  category: z.string().min(1),
  description: z.string().max(2000),
  estimated_income: z.number().positive().optional(),
  time_to_profit: z.number().positive().optional()
});

export const userPreferencesSchema = z.object({
  risk_tolerance: z.enum(['very_conservative', 'conservative', 'moderate', 'aggressive', 'very_aggressive']).optional(),
  target_industries: z.array(z.string()).optional(),
  investment_size_min: z.number().positive().optional(),
  investment_size_max: z.number().positive().optional()
});

export const validateInput = (schema, data) => {
  try {
    return { success: true, data: schema.parse(data) };
  } catch (error) {
    return { success: false, error: error.errors?.[0]?.message || 'Validation failed' };
  }
};