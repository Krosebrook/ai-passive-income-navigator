# Troubleshooting Guide

## Common Issues and Solutions

This guide helps you resolve common problems when developing or deploying the AI Passive Income Navigator.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Development Server Issues](#development-server-issues)
- [Build Issues](#build-issues)
- [Runtime Errors](#runtime-errors)
- [API and Backend Issues](#api-and-backend-issues)
- [Styling Issues](#styling-issues)
- [Performance Issues](#performance-issues)
- [Testing Issues](#testing-issues)
- [Deployment Issues](#deployment-issues)

## Installation Issues

### npm install fails

**Symptoms:** Errors during `npm install`

**Solutions:**

1. **Clear npm cache:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

2. **Check Node version:**
```bash
node --version  # Should be 18.x or higher
```

3. **Use specific npm version:**
```bash
npm install -g npm@9
```

4. **Check for permission issues:**
```bash
# On Unix/Mac
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) node_modules
```

### Dependency conflicts

**Symptoms:** Peer dependency warnings or conflicts

**Solutions:**

1. **Use --legacy-peer-deps:**
```bash
npm install --legacy-peer-deps
```

2. **Update package.json:**
```bash
npm update
```

3. **Manual resolution:**
```json
// package.json
{
  "overrides": {
    "problematic-package": "specific-version"
  }
}
```

## Development Server Issues

### Port already in use

**Symptoms:** `Error: listen EADDRINUSE: address already in use :::5173`

**Solutions:**

1. **Kill process on port:**
```bash
# Find process
lsof -i :5173

# Kill process
kill -9 <PID>
```

2. **Use different port:**
```bash
# Edit vite.config.js
export default defineConfig({
  server: {
    port: 3000
  }
});
```

### Hot reload not working

**Symptoms:** Changes not reflected in browser

**Solutions:**

1. **Hard refresh browser:**
   - Chrome/Firefox: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

2. **Clear Vite cache:**
```bash
rm -rf node_modules/.vite
npm run dev
```

3. **Check file watcher limits (Linux):**
```bash
# Increase limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Module not found errors

**Symptoms:** `Error: Cannot find module '@/components/...'`

**Solutions:**

1. **Check import path:**
```javascript
// Correct
import Component from '@/components/Component';

// Also correct (relative)
import Component from './Component';
```

2. **Verify jsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

3. **Restart dev server:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

## Build Issues

### Build fails with out of memory error

**Symptoms:** `JavaScript heap out of memory`

**Solutions:**

1. **Increase Node memory:**
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

2. **Add to package.json:**
```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
  }
}
```

### Build succeeds but app doesn't load

**Symptoms:** Blank page or errors in production build

**Solutions:**

1. **Check browser console for errors**

2. **Verify base path:**
```javascript
// vite.config.js
export default defineConfig({
  base: '/' // or '/your-subdirectory/'
});
```

3. **Test production build locally:**
```bash
npm run build
npm run preview
```

4. **Check environment variables:**
```bash
# Verify all VITE_ prefixed variables are set
echo $VITE_BASE44_APP_ID
```

### CSS not loading in production

**Symptoms:** No styles in production build

**Solutions:**

1. **Verify Tailwind config:**
```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
};
```

2. **Check PostCSS config:**
```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## Runtime Errors

### White screen / blank page

**Symptoms:** Application doesn't render

**Solutions:**

1. **Check browser console:**
   - Open DevTools (F12)
   - Look for JavaScript errors
   - Fix errors from bottom up

2. **Common causes:**
   - Uncaught exceptions in render
   - Missing dependencies
   - Incorrect imports
   - Environment variables not set

3. **Add error boundary:**
```jsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    return this.props.children;
  }
}
```

### React Hook errors

**Symptoms:** `Invalid hook call` or `Rendered more hooks than during previous render`

**Solutions:**

1. **Check hook rules:**
   - Only call hooks at the top level
   - Don't call hooks inside loops, conditions, or nested functions
   - Only call hooks from React functions

2. **Common mistakes:**
```javascript
// ❌ Bad: Hook in condition
if (condition) {
  const [state, setState] = useState();
}

// ✅ Good
const [state, setState] = useState();
if (condition) {
  // use state
}
```

3. **Check for duplicate React versions:**
```bash
npm ls react
# Should show only one version
```

## API and Backend Issues

### Authentication errors

**Symptoms:** `AUTH_REQUIRED` or 401 errors

**Solutions:**

1. **Enable authentication:**
```javascript
// src/api/base44Client.js
export const base44 = createClient({
  requiresAuth: true, // Make sure this is true
});
```

2. **Clear auth state:**
```javascript
localStorage.clear();
// Refresh page and login again
```

3. **Check token expiration:**
   - Tokens expire after set duration
   - Implement refresh token logic

### CORS errors

**Symptoms:** `Access-Control-Allow-Origin` errors

**Solutions:**

1. **Check Base44 CORS settings:**
   - Log in to Base44 dashboard
   - Check allowed origins
   - Add your domain

2. **Verify API URL:**
```javascript
// .env.local
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

3. **Check for typos in URLs**

### API calls failing

**Symptoms:** Network errors or timeouts

**Solutions:**

1. **Check network tab:**
   - Open DevTools → Network
   - Look for failed requests
   - Check request/response data

2. **Verify environment variables:**
```bash
# Make sure all variables are set
cat .env.local
```

3. **Test API endpoint:**
```bash
curl https://your-app.base44.app/api/ideas
```

4. **Check error response:**
```javascript
const { error } = useQuery({
  queryKey: ['ideas'],
  queryFn: () => base44.ideas.list(),
});

console.log('Error details:', error);
```

## Styling Issues

### Tailwind classes not working

**Symptoms:** CSS classes not applying styles

**Solutions:**

1. **Verify Tailwind is imported:**
```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

2. **Check class names:**
```jsx
// ✅ Correct
<div className="bg-blue-500 text-white">

// ❌ Wrong
<div class="bg-blue-500 text-white">
```

3. **Rebuild and clear cache:**
```bash
rm -rf node_modules/.vite
npm run dev
```

4. **Check content paths:**
```javascript
// tailwind.config.js
content: [
  "./src/**/*.{js,jsx}",
],
```

### Styles not updating

**Symptoms:** CSS changes not reflected

**Solutions:**

1. **Hard refresh:** `Ctrl+Shift+R` or `Cmd+Shift+R`

2. **Clear browser cache**

3. **Restart dev server**

4. **Check for CSS specificity conflicts:**
```css
/* More specific selector wins */
.component button { } /* Less specific */
.component .specific-button { } /* More specific */
```

## Performance Issues

### Slow initial load

**Symptoms:** Application takes long to load initially

**Solutions:**

1. **Analyze bundle size:**
```bash
npm run build -- --report
```

2. **Implement code splitting:**
```javascript
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

3. **Optimize images:**
   - Use appropriate formats (WebP)
   - Compress images
   - Use lazy loading

4. **Remove unused dependencies:**
```bash
npm uninstall unused-package
```

### Slow rendering

**Symptoms:** UI feels sluggish or laggy

**Solutions:**

1. **Use React DevTools Profiler:**
   - Identify slow components
   - Look for unnecessary re-renders

2. **Memoize expensive calculations:**
```javascript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

3. **Memoize components:**
```javascript
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* ... */}</div>;
});
```

4. **Use useCallback for callbacks:**
```javascript
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

### Memory leaks

**Symptoms:** Application becomes slower over time

**Solutions:**

1. **Clean up effects:**
```javascript
useEffect(() => {
  const subscription = api.subscribe();
  
  // Cleanup function
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

2. **Cancel pending API calls:**
```javascript
useEffect(() => {
  const controller = new AbortController();
  
  fetch(url, { signal: controller.signal });
  
  return () => controller.abort();
}, []);
```

3. **Clear timers:**
```javascript
useEffect(() => {
  const timer = setTimeout(() => {}, 1000);
  
  return () => clearTimeout(timer);
}, []);
```

## Testing Issues

### Tests failing

**Symptoms:** Tests fail unexpectedly

**Solutions:**

1. **Check test output:**
```bash
npm test -- --reporter=verbose
```

2. **Run single test:**
```bash
npm test -- --run MyComponent.test.jsx
```

3. **Clear test cache:**
```bash
npm test -- --clearCache
```

4. **Check for async issues:**
```javascript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### Mock not working

**Symptoms:** Mocks not being used in tests

**Solutions:**

1. **Verify mock path:**
```javascript
vi.mock('@/api/base44Client', () => ({
  base44: { /* mock */ }
}));
```

2. **Clear mocks between tests:**
```javascript
afterEach(() => {
  vi.clearAllMocks();
});
```

3. **Check mock implementation:**
```javascript
const mockFn = vi.fn();
mockFn.mockReturnValue('value');
// or
mockFn.mockResolvedValue(Promise.resolve('value'));
```

## Deployment Issues

### Deployment fails

**Symptoms:** Build or deployment errors

**Solutions:**

1. **Check build logs:**
   - Look for specific error messages
   - Fix errors and retry

2. **Verify environment variables:**
   - All required variables set
   - Correct values for environment

3. **Test build locally:**
```bash
npm run build
npm run preview
```

4. **Check node version:**
```bash
# Deployment platform should use Node 18+
```

### App works locally but not in production

**Symptoms:** Different behavior in production

**Solutions:**

1. **Check environment variables:**
   - Development vs. production values
   - All variables prefixed with `VITE_`

2. **Test production build locally:**
```bash
npm run build
npm run preview
```

3. **Check browser console in production**

4. **Verify API endpoints:**
   - Correct production URLs
   - CORS configured for production domain

## Getting More Help

If you're still stuck:

1. **Check existing issues:**
   - [GitHub Issues](https://github.com/Krosebrook/ai-passive-income-navigator/issues)

2. **Search documentation:**
   - [Base44 Docs](https://docs.base44.com)
   - [Vite Docs](https://vitejs.dev)
   - [React Docs](https://react.dev)

3. **Open a new issue:**
   - Include error messages
   - Steps to reproduce
   - Environment details

4. **Contact support:**
   - Base44 support for platform issues

## Related Documentation

- [Development Guide](./DEVELOPMENT.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Architecture Documentation](../ARCHITECTURE.md)

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-19  
**Maintained by**: Development Team
