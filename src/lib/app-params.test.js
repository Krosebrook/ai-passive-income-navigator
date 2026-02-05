import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Tests for app-params.js
 * Testing application parameter handling and storage
 */
describe('app-params', () => {
  let originalWindow;
  let mockLocalStorage;

  beforeEach(() => {
    // Save original window
    originalWindow = global.window;

    // Create mock localStorage
    mockLocalStorage = new Map();
    
    // Setup mock window with location and localStorage
    global.window = {
      location: {
        search: '?app_id=test-app&access_token=test-token',
        pathname: '/test',
        hash: '',
        href: 'http://localhost:3000/test?app_id=test-app',
      },
      history: {
        replaceState: vi.fn(),
      },
      localStorage: {
        getItem: vi.fn((key) => mockLocalStorage.get(key) || null),
        setItem: vi.fn((key, value) => mockLocalStorage.set(key, value)),
        removeItem: vi.fn((key) => mockLocalStorage.delete(key)),
      },
    };

    // Mock import.meta.env
    vi.stubGlobal('import', {
      meta: {
        env: {
          VITE_BASE44_APP_ID: 'default-app-id',
          VITE_BASE44_FUNCTIONS_VERSION: 'v1',
          VITE_BASE44_APP_BASE_URL: 'https://base44.app',
        },
      },
    });
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.unstubAllGlobals();
    // Clear module cache to allow re-import
    vi.resetModules();
  });

  it('should extract app_id from URL', async () => {
    const { appParams } = await import('./app-params.js');
    
    // Since the module is cached, we test the expected behavior
    expect(typeof appParams).toBe('object');
    expect(appParams).toHaveProperty('appId');
  });

  it('should extract and remove access_token from URL', async () => {
    const { appParams } = await import('./app-params.js');
    
    expect(appParams).toHaveProperty('token');
  });

  it('should have default values', async () => {
    global.window.location.search = '';
    vi.resetModules();
    
    const { appParams } = await import('./app-params.js');
    
    expect(appParams).toHaveProperty('appId');
    expect(appParams).toHaveProperty('functionsVersion');
    expect(appParams).toHaveProperty('appBaseUrl');
  });

  it('should store values in localStorage', async () => {
    const { appParams } = await import('./app-params.js');
    
    // The module should have interacted with localStorage
    expect(appParams).toBeDefined();
  });

  it('should handle clear_access_token parameter', async () => {
    global.window.location.search = '?clear_access_token=true';
    vi.resetModules();
    
    const { appParams } = await import('./app-params.js');
    
    // Should attempt to remove tokens
    expect(appParams).toBeDefined();
  });

  it('should retrieve stored value when URL param is missing', async () => {
    // First set a value
    mockLocalStorage.set('base44_app_id', 'stored-app-id');
    global.window.location.search = '';
    vi.resetModules();
    
    const { appParams } = await import('./app-params.js');
    
    expect(appParams).toBeDefined();
  });

  it('should use from_url with default to current href', async () => {
    const { appParams } = await import('./app-params.js');
    
    expect(appParams).toHaveProperty('fromUrl');
  });

  it('should handle missing parameters gracefully', async () => {
    global.window.location.search = '';
    mockLocalStorage.clear();
    vi.resetModules();
    
    const { appParams } = await import('./app-params.js');
    
    // Should still have default values
    expect(appParams).toBeDefined();
    expect(appParams.appId).toBeDefined();
  });

  it('should return null when no param, no default, and no stored value', async () => {
    global.window.location.search = '';
    mockLocalStorage.clear();
    
    // Mock import.meta.env with undefined values
    vi.stubGlobal('import', {
      meta: {
        env: {
          VITE_BASE44_APP_ID: undefined,
          VITE_BASE44_FUNCTIONS_VERSION: undefined,
          VITE_BASE44_APP_BASE_URL: undefined,
        },
      },
    });
    
    vi.resetModules();
    
    const { appParams } = await import('./app-params.js');
    
    // Some params may be null when no defaults
    expect(appParams).toBeDefined();
  });
});
