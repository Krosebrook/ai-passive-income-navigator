// Input validation utilities for production safety

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required and must be a string');
  }
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  return email.toLowerCase().trim();
}

export function validateNumber(value, fieldName, { min, max } = {}) {
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  if (min !== undefined && num < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }
  if (max !== undefined && num > max) {
    throw new Error(`${fieldName} must be at most ${max}`);
  }
  return num;
}

export function validateString(value, fieldName, { minLength = 0, maxLength = 10000 } = {}) {
  if (!value || typeof value !== 'string') {
    throw new Error(`${fieldName} is required and must be a string`);
  }
  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters`);
  }
  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} must be at most ${maxLength} characters`);
  }
  return trimmed;
}

export function validateEnum(value, fieldName, allowedValues) {
  if (!allowedValues.includes(value)) {
    throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }
  return value;
}

export function sanitizeObject(obj, maxDepth = 5, currentDepth = 0) {
  if (currentDepth > maxDepth) {
    throw new Error('Object nesting too deep');
  }
  
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, maxDepth, currentDepth + 1));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Remove potentially dangerous keys
    if (key.startsWith('__') || key === 'constructor' || key === 'prototype') {
      continue;
    }
    sanitized[key] = sanitizeObject(value, maxDepth, currentDepth + 1);
  }
  return sanitized;
}

export function validateDateString(dateStr, fieldName) {
  if (!dateStr) {
    throw new Error(`${fieldName} is required`);
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid date`);
  }
  return dateStr;
}

export function validateArray(arr, fieldName, { minLength = 0, maxLength = 1000 } = {}) {
  if (!Array.isArray(arr)) {
    throw new Error(`${fieldName} must be an array`);
  }
  if (arr.length < minLength) {
    throw new Error(`${fieldName} must have at least ${minLength} items`);
  }
  if (arr.length > maxLength) {
    throw new Error(`${fieldName} must have at most ${maxLength} items`);
  }
  return arr;
}

export function validatePreferences(preferences) {
  const validated = {};
  
  if (preferences.passive_income_goal) {
    validated.passive_income_goal = validateEnum(
      preferences.passive_income_goal,
      'passive_income_goal',
      ['side_income', 'supplement', 'replace_job', 'financial_freedom']
    );
  }
  
  if (preferences.risk_tolerance) {
    validated.risk_tolerance = validateEnum(
      preferences.risk_tolerance,
      'risk_tolerance',
      ['very_conservative', 'conservative', 'moderate', 'aggressive', 'very_aggressive']
    );
  }
  
  if (preferences.time_commitment !== undefined) {
    validated.time_commitment = validateNumber(preferences.time_commitment, 'time_commitment', { min: 0, max: 4 });
  }
  
  if (preferences.target_industries) {
    validated.target_industries = validateArray(preferences.target_industries, 'target_industries', { maxLength: 20 });
  }
  
  if (preferences.investment_size_min !== undefined) {
    validated.investment_size_min = validateNumber(preferences.investment_size_min, 'investment_size_min', { min: 0 });
  }
  
  if (preferences.investment_size_max !== undefined) {
    validated.investment_size_max = validateNumber(preferences.investment_size_max, 'investment_size_max', { min: 0 });
  }
  
  // Validate min < max
  if (validated.investment_size_min && validated.investment_size_max) {
    if (validated.investment_size_min > validated.investment_size_max) {
      throw new Error('investment_size_min must be less than investment_size_max');
    }
  }
  
  return validated;
}