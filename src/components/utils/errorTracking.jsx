export const captureError = (error, context = {}) => {
  const errorData = {
    timestamp: new Date().toISOString(),
    message: error?.message || String(error),
    stack: error?.stack,
    context,
    url: typeof window !== 'undefined' ? window.location.href : null
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', errorData);
  }

  // Send to error tracking endpoint
  try {
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData)
    }).catch(() => {});
  } catch (e) {
    // Fail silently
  }
};

export const initializeErrorTracking = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (e) => {
      captureError(e.error, { type: 'uncaught_error' });
    });
    window.addEventListener('unhandledrejection', (e) => {
      captureError(e.reason, { type: 'unhandled_promise' });
    });
  }
};