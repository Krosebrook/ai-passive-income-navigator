import { describe, it, expect } from 'vitest';
import { cn, isIframe } from './utils';

/**
 * Tests for lib/utils.js
 * Testing utility functions for Tailwind class merging and iframe detection
 */
describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('px-2 py-1', 'bg-blue-500')).toBe('px-2 py-1 bg-blue-500');
  });

  it('should handle conditional classes', () => {
    expect(cn('text-base', true && 'font-bold')).toBe('text-base font-bold');
    expect(cn('text-base', false && 'font-bold')).toBe('text-base');
  });

  it('should override conflicting Tailwind classes', () => {
    // tailwind-merge should keep the later class
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('should handle empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });

  it('should handle arrays', () => {
    expect(cn(['text-base', 'font-bold'])).toBe('text-base font-bold');
  });

  it('should handle object syntax', () => {
    expect(cn('text-base', { 'text-lg': true, 'font-bold': false })).toContain('text-lg');
  });

  it('should handle null and undefined', () => {
    expect(cn('text-base', null, undefined, 'font-bold')).toBe('text-base font-bold');
  });
});

describe('isIframe', () => {
  it('should be a boolean value', () => {
    expect(typeof isIframe).toBe('boolean');
  });

  it('should detect iframe context', () => {
    // In test environment, window.self === window.top
    expect(isIframe).toBe(false);
  });
});
