import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * ErrorBoundary component to catch React errors and prevent app crashes
 * Safe addition: wraps existing components without changing their behavior
 * Only activates when errors occur, otherwise renders children normally
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Store error info in state for display
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // If error logging service is available, log there
    // Placeholder for Sentry or other error logging service
    try {
      if (window.errorLogger) {
        window.errorLogger.captureException(error, { errorInfo });
      }
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {this.props.title || 'Something went wrong'}
                </h2>
                <p className="text-sm text-gray-500">
                  {this.props.message || 'An unexpected error occurred'}
                </p>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200 overflow-auto max-h-48">
                <p className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                onClick={() => {
                  // Use replace to avoid full page reload
                  // This preserves React Router state and is more performant
                  window.history.replaceState(null, '', '/');
                  window.location.reload();
                }}
                variant="default"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
