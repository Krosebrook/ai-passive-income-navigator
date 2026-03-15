import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests for lib/env.js
 * Validates environment variable checking logic.
 *
 * Note: import.meta.env is replaced at build time by Vite; in the test
 * environment we mock it via vi.stubGlobal so that the module under test
 * reads the values we control.
 */

// We import after stubbing so the module picks up our mocks.
// Using a factory pattern via vi.mock to control import.meta.env.

describe('validateEnv', () => {
  const ORIGINAL_ENV = { ...import.meta.env };

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('does not throw when all required vars are set', async () => {
    vi.stubEnv('VITE_BASE44_APP_ID', 'test-app-id');
    vi.stubEnv('VITE_BASE44_APP_BASE_URL', 'https://test.base44.app');
    vi.stubEnv('DEV', true);

    // Re-import to get the module with current env
    const { validateEnv } = await import('./env.js?v=1');
    expect(() => validateEnv()).not.toThrow();
  });

  it('throws in dev when VITE_BASE44_APP_ID is missing', async () => {
    vi.stubEnv('VITE_BASE44_APP_ID', '');
    vi.stubEnv('VITE_BASE44_APP_BASE_URL', 'https://test.base44.app');
    vi.stubEnv('DEV', true);

    const { validateEnv } = await import('./env.js?v=2');
    expect(() => validateEnv()).toThrow('VITE_BASE44_APP_ID');
  });

  it('throws in dev when VITE_BASE44_APP_BASE_URL is missing', async () => {
    vi.stubEnv('VITE_BASE44_APP_ID', 'test-app-id');
    vi.stubEnv('VITE_BASE44_APP_BASE_URL', '');
    vi.stubEnv('DEV', true);

    const { validateEnv } = await import('./env.js?v=3');
    expect(() => validateEnv()).toThrow('VITE_BASE44_APP_BASE_URL');
  });

  it('logs a warning in production instead of throwing', async () => {
    vi.stubEnv('VITE_BASE44_APP_ID', '');
    vi.stubEnv('VITE_BASE44_APP_BASE_URL', '');
    vi.stubEnv('DEV', false);
    vi.stubEnv('PROD', true);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { validateEnv } = await import('./env.js?v=4');
    expect(() => validateEnv()).not.toThrow();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('[env]'));
  });
});

describe('requireEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns the value when the variable is set', async () => {
    vi.stubEnv('VITE_BASE44_APP_ID', 'my-app-id');
    const { requireEnv } = await import('./env.js?v=5');
    expect(requireEnv('VITE_BASE44_APP_ID')).toBe('my-app-id');
  });

  it('throws when the variable is not set', async () => {
    vi.stubEnv('VITE_BASE44_APP_ID', '');
    const { requireEnv } = await import('./env.js?v=6');
    expect(() => requireEnv('VITE_BASE44_APP_ID')).toThrow('VITE_BASE44_APP_ID');
  });
});
