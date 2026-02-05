import { describe, it, expect, vi } from 'vitest';

/**
 * Tests for base44Client.js
 * Testing client initialization with proper configuration
 */

// Mock the @base44/sdk module
vi.mock('@base44/sdk', () => ({
  createClient: vi.fn((config) => ({
    config,
    auth: {
      me: vi.fn(),
      logout: vi.fn(),
      redirectToLogin: vi.fn(),
    },
    query: vi.fn(),
    mutate: vi.fn(),
  })),
}));

// Mock app-params
vi.mock('@/lib/app-params', () => ({
  appParams: {
    appId: 'test-app-id',
    token: 'test-token',
    functionsVersion: 'v1',
    appBaseUrl: 'https://test.base44.app',
  },
}));

describe('base44Client', () => {
  it('should create a base44 client', async () => {
    const { base44 } = await import('./base44Client.js');
    
    expect(base44).toBeDefined();
    expect(base44).toHaveProperty('auth');
  });

  it('should initialize with app parameters', async () => {
    const { createClient } = await import('@base44/sdk');
    
    // Verify createClient was called
    expect(createClient).toHaveBeenCalled();
  });

  it('should have auth methods', async () => {
    const { base44 } = await import('./base44Client.js');
    
    expect(base44.auth).toBeDefined();
    expect(base44.auth).toHaveProperty('me');
    expect(base44.auth).toHaveProperty('logout');
    expect(base44.auth).toHaveProperty('redirectToLogin');
  });

  it('should configure client with correct parameters', async () => {
    const { createClient } = await import('@base44/sdk');
    const { base44 } = await import('./base44Client.js');
    
    expect(createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        appId: expect.any(String),
        token: expect.any(String),
        functionsVersion: expect.any(String),
        appBaseUrl: expect.any(String),
        requiresAuth: false,
      })
    );
  });
});
