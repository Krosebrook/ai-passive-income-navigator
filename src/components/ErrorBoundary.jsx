import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error tracking service (Sentry)
    if (window.__SENTRY__) {
      window.__SENTRY__.captureException(error, { contexts: { react: errorInfo } });
    }
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We've logged this error and our team will look into it.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Return to Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}