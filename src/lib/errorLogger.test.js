import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import errorLogger from './errorLogger';

/**
 * Tests for errorLogger.js
 * Testing centralized error logging with console fallback
 */
describe('ErrorLogger', () => {
  let consoleErrorSpy;
  let consoleLogSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('captureException', () => {
    it('should log errors to console', () => {
      const error = new Error('Test error');
      errorLogger.captureException(error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ErrorLogger] Exception captured:',
        error
      );
    });

    it('should log error with context', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'submit' };
      
      errorLogger.captureException(error, context);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ErrorLogger] Exception captured:',
        error
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ErrorLogger] Context:',
        context
      );
    });

    it('should handle empty context', () => {
      const error = new Error('Test error');
      errorLogger.captureException(error, {});
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ErrorLogger] Exception captured:',
        error
      );
      // Should not log empty context
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        '[ErrorLogger] Context:',
        {}
      );
    });

    it('should work when Sentry is enabled', () => {
      const error = new Error('Test error');
      const mockSentry = {
        captureException: vi.fn(),
      };
      
      // Temporarily enable Sentry
      errorLogger.sentryEnabled = true;
      global.window = { Sentry: mockSentry };
      
      errorLogger.captureException(error);
      
      expect(mockSentry.captureException).toHaveBeenCalledWith(error, {
        contexts: { additional: {} }
      });
      
      // Clean up
      errorLogger.sentryEnabled = false;
      delete global.window;
    });
  });

  describe('captureMessage', () => {
    it('should log info messages', () => {
      errorLogger.captureMessage('Test message', 'info');
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ErrorLogger] INFO: Test message',
        {}
      );
    });

    it('should log warning messages', () => {
      errorLogger.captureMessage('Warning message', 'warning');
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[ErrorLogger] WARNING: Warning message',
        {}
      );
    });

    it('should log error messages', () => {
      errorLogger.captureMessage('Error message', 'error');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ErrorLogger] ERROR: Error message',
        {}
      );
    });

    it('should default to info level', () => {
      errorLogger.captureMessage('Default message');
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ErrorLogger] INFO: Default message',
        {}
      );
    });

    it('should log message with context', () => {
      const context = { page: 'dashboard' };
      errorLogger.captureMessage('Test message', 'info', context);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ErrorLogger] INFO: Test message',
        context
      );
    });

    it('should handle logging errors gracefully', () => {
      consoleLogSpy.mockImplementation(() => {
        throw new Error('Console error');
      });
      
      expect(() => errorLogger.captureMessage('Test')).not.toThrow();
    });

    it('should work when Sentry is enabled', () => {
      const mockSentry = {
        captureMessage: vi.fn(),
      };
      
      errorLogger.sentryEnabled = true;
      global.window = { Sentry: mockSentry };
      
      errorLogger.captureMessage('Test message', 'info');
      
      expect(mockSentry.captureMessage).toHaveBeenCalledWith('Test message', {
        level: 'info',
        contexts: { additional: {} }
      });
      
      errorLogger.sentryEnabled = false;
      delete global.window;
    });
  });

  describe('setUser', () => {
    it('should log user context', () => {
      const user = { id: 'user123', email: 'test@example.com' };
      errorLogger.setUser(user);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ErrorLogger] User context set:',
        'user123'
      );
    });

    it('should handle anonymous users', () => {
      errorLogger.setUser({});
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ErrorLogger] User context set:',
        'anonymous'
      );
    });

    it('should handle null user', () => {
      errorLogger.setUser(null);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ErrorLogger] User context set:',
        'anonymous'
      );
    });

    it('should handle errors gracefully', () => {
      consoleLogSpy.mockImplementation(() => {
        throw new Error('Console error');
      });
      
      expect(() => errorLogger.setUser({ id: 'test' })).not.toThrow();
    });

    it('should work when Sentry is enabled', () => {
      const mockSentry = {
        setUser: vi.fn(),
      };
      const user = { id: 'user123' };
      
      errorLogger.sentryEnabled = true;
      global.window = { Sentry: mockSentry };
      
      errorLogger.setUser(user);
      
      expect(mockSentry.setUser).toHaveBeenCalledWith(user);
      
      errorLogger.sentryEnabled = false;
      delete global.window;
    });
  });

  describe('addBreadcrumb', () => {
    it('should not throw when adding breadcrumb', () => {
      const breadcrumb = {
        message: 'User clicked button',
        category: 'ui',
      };
      
      expect(() => {
        errorLogger.addBreadcrumb(breadcrumb);
      }).not.toThrow();
    });

    it('should handle errors gracefully', () => {
      const breadcrumb = { message: 'test' };
      
      // Mock Sentry to throw an error
      errorLogger.sentryEnabled = true;
      global.window = {
        Sentry: {
          addBreadcrumb: () => {
            throw new Error('Sentry error');
          }
        }
      };
      
      expect(() => errorLogger.addBreadcrumb(breadcrumb)).not.toThrow();
      
      errorLogger.sentryEnabled = false;
      delete global.window;
    });

    it('should work when Sentry is enabled', () => {
      const mockSentry = {
        addBreadcrumb: vi.fn(),
      };
      const breadcrumb = { message: 'test', category: 'ui' };
      
      errorLogger.sentryEnabled = true;
      global.window = { Sentry: mockSentry };
      
      errorLogger.addBreadcrumb(breadcrumb);
      
      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(breadcrumb);
      
      errorLogger.sentryEnabled = false;
      delete global.window;
    });
  });

  describe('init', () => {
    it('should be initialized by default', () => {
      expect(errorLogger.initialized).toBe(true);
    });

    it('should not reinitialize when called multiple times', () => {
      const initialState = errorLogger.initialized;
      errorLogger.init();
      expect(errorLogger.initialized).toBe(initialState);
    });
  });
});
