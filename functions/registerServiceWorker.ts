// Service Worker registration (call on app init, not a Deno handler)
// This is a helper to include in main app boot

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        // Service worker files are placed in public/ and served from root
        // Base44 platform serves public/ files automatically
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
        });
        
        console.log('✓ Service Worker registered:', registration);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every 60 seconds

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('🔄 App update available');
              // Optionally notify user
            }
          });
        });
      } catch (error) {
        console.error('✗ Service Worker registration failed:', error);
      }
    });
  }
}

// Initialize on app mount (add to main App component or pages/Home useEffect)
// registerServiceWorker();