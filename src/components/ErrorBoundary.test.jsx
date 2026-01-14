import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Tests for ErrorBoundary component
 * Safe addition: Tests the error boundary we just added
 * Ensures error handling works correctly without affecting normal rendering
 */

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render error UI when child throws error', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    render(
      <ErrorBoundary title="Test Error">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test Error')).toBeInTheDocument();
    
    // Restore console.error
    console.error = originalError;
  });

  it('should render custom message when provided', () => {
    const originalError = console.error;
    console.error = () => {};

    render(
      <ErrorBoundary message="Custom error message">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    
    console.error = originalError;
  });
});
