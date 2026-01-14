/**
 * Error logging utility with fallback console logging
 * Safe addition: Provides centralized error logging infrastructure
 * Can be easily extended to integrate with Sentry or other services
 * Uses console.error as fallback to ensure errors are never silently lost
 */

class ErrorLogger {
  constructor() {
    this.initialized = false;
    this.sentryEnabled = false;
  }

  /**
   * Initialize error logging service (placeholder for Sentry/etc.)
   * Safe to call multiple times - will only initialize once
   */
  init(config = {}) {
    if (this.initialized) {
      return;
    }

    try {
      // Placeholder for Sentry initialization
      // Uncomment and configure when ready to use Sentry:
      // if (config.sentryDsn) {
      //   Sentry.init({
      //     dsn: config.sentryDsn,
      //     environment: config.environment || 'production',
      //     tracesSampleRate: config.tracesSampleRate || 0.1,
      //   });
      //   this.sentryEnabled = true;
      // }

      // Make logger available globally for ErrorBoundary
      // This is intentional: ErrorBoundary is a class component that can't use hooks/context
      // Alternative approaches would require converting ErrorBoundary to a function component
      // or passing the logger as a prop through many layers, which adds complexity
      if (typeof window !== 'undefined') {
        window.errorLogger = this;
      }

      this.initialized = true;
      console.log('[ErrorLogger] Initialized (using console fallback)');
    } catch (error) {
      console.error('[ErrorLogger] Failed to initialize:', error);
    }
  }

  /**
   * Log an error with context
   * @param {Error} error - The error object
   * @param {Object} context - Additional context about the error
   */
  captureException(error, context = {}) {
    try {
      // Try to log to external service if available
      if (this.sentryEnabled && window.Sentry) {
        window.Sentry.captureException(error, {
          contexts: { additional: context }
        });
      }

      // Always log to console as fallback
      console.error('[ErrorLogger] Exception captured:', error);
      if (Object.keys(context).length > 0) {
        console.error('[ErrorLogger] Context:', context);
      }
    } catch (loggingError) {
      // Ensure logging failures don't break the app
      console.error('[ErrorLogger] Failed to log error:', loggingError);
      console.error('[ErrorLogger] Original error:', error);
    }
  }

  /**
   * Log a message with severity level
   * @param {string} message - The message to log
   * @param {string} level - Severity level (info, warning, error)
   * @param {Object} context - Additional context
   */
  captureMessage(message, level = 'info', context = {}) {
    try {
      if (this.sentryEnabled && window.Sentry) {
        window.Sentry.captureMessage(message, {
          level,
          contexts: { additional: context }
        });
      }

      // Log to console
      const logMethod = level === 'error' ? console.error : 
                       level === 'warning' ? console.warn : 
                       console.log;
      
      logMethod(`[ErrorLogger] ${level.toUpperCase()}: ${message}`, context);
    } catch (loggingError) {
      console.error('[ErrorLogger] Failed to log message:', loggingError);
    }
  }

  /**
   * Set user context for error tracking
   * @param {Object} user - User information
   */
  setUser(user) {
    try {
      if (this.sentryEnabled && window.Sentry) {
        window.Sentry.setUser(user);
      }
      console.log('[ErrorLogger] User context set:', user?.id || 'anonymous');
    } catch (error) {
      console.error('[ErrorLogger] Failed to set user context:', error);
    }
  }

  /**
   * Add breadcrumb for error tracking
   * @param {Object} breadcrumb - Breadcrumb data
   */
  addBreadcrumb(breadcrumb) {
    try {
      if (this.sentryEnabled && window.Sentry) {
        window.Sentry.addBreadcrumb(breadcrumb);
      }
    } catch (error) {
      console.error('[ErrorLogger] Failed to add breadcrumb:', error);
    }
  }
}

// Create singleton instance
const errorLogger = new ErrorLogger();

// Auto-initialize with console fallback
errorLogger.init({
  // Add configuration here when ready to use external service
  // sentryDsn: process.env.VITE_SENTRY_DSN,
  // environment: process.env.MODE,
});

export default errorLogger;
