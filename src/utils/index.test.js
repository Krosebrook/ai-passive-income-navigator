import { describe, it, expect } from 'vitest';
import { createPageUrl } from '../utils';

/**
 * Tests for createPageUrl utility function
 * Safe addition: Tests existing working code without modifying it
 * Ensures URL generation works correctly for navigation
 */
describe('createPageUrl', () => {
  it('should convert page name to URL format', () => {
    expect(createPageUrl('Home')).toBe('/Home');
    expect(createPageUrl('Dashboard')).toBe('/Dashboard');
  });

  it('should replace spaces with hyphens', () => {
    expect(createPageUrl('Profile Settings')).toBe('/Profile-Settings');
    expect(createPageUrl('My Portfolio')).toBe('/My-Portfolio');
  });

  it('should handle single word names', () => {
    expect(createPageUrl('Portfolio')).toBe('/Portfolio');
  });

  it('should handle multiple spaces', () => {
    expect(createPageUrl('My New Page')).toBe('/My-New-Page');
  });
});
