# FlashFusion Routing & Authentication Guide

## Public vs Protected Routes

### Public Routes (No Authentication Required)
- `/splash` - Splash screen with rocket animation
- `/landing` - Marketing landing page with login/signup CTAs
- `/auth/*` - Authentication pages (handled by Base44)

### Protected Routes (Authentication Required)
All other routes require authentication:
- `/home` - Dashboard home
- `/portfolio` - Portfolio management
- `/ai-coach` - AI coaching and deal sourcing
- `/community` - Community features
- `/deal-pipeline` - Deal pipeline management
- `/user-preferences` - User settings
- `/profile-settings` - Profile configuration
- All other app pages

## User Flow

### First-Time Visitor (Logged Out)
1. Opens app → `/splash` (auto-loads)
2. After 1.2s → `/landing` (auto-navigates)
3. Sees marketing content + "Log In" / "Sign Up" buttons
4. Clicks "Log In" → Base44 auth flow
5. After login → redirects to `/home` (or returnTo URL if accessing protected route)

### Returning User (Logged In)
1. Opens app → `/splash`
2. After 1.2s → `/landing`
3. Sees "Go to Dashboard" button
4. Clicks → `/home` (or can directly navigate to any protected route)

### Direct Protected Route Access (Logged Out)
1. User navigates to `/portfolio` (while logged out)
2. Auth check fails
3. Redirects to Base44 login with `returnTo=/portfolio`
4. After successful login → redirects back to `/portfolio`

## Implementation Details

### Layout Component Logic
```javascript
const PUBLIC_PAGES = ['Splash', 'Landing'];

export default function Layout({ children, currentPageName }) {
  const isPublicPage = PUBLIC_PAGES.includes(currentPageName);
  
  // Skip auth check and navigation for public pages
  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-[#0f0618]">
        <SEOHead />
        {children}
      </div>
    );
  }
  
  // Normal authenticated layout with nav, footer, etc.
  // ...
}
```

### Protected Route Wrapper
```javascript
// components/routing/ProtectedRoute.jsx
export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        const returnTo = encodeURIComponent(location.pathname);
        base44.auth.redirectToLogin(`/home?returnTo=${returnTo}`);
      }
    };
    checkAuth();
  }, []);
  
  return isAuthenticated ? children : <LoadingSpinner />;
}
```

## Base44 File-Based Routing

Base44 uses file-based routing where:
- Files in `/pages` directory automatically become routes
- `pages/Home.js` → `/home`
- `pages/Portfolio.js` → `/portfolio`
- `pages/Splash.js` → `/splash`
- `pages/Landing.js` → `/landing`

The Layout component receives `currentPageName` prop to determine which page is active.

## Manual Verification Checklist

### Test 1: Fresh Browser (Logged Out)
- [ ] Open app in incognito window
- [ ] Should see Splash page with rocket animation
- [ ] After ~1.2s, auto-navigates to Landing page
- [ ] Landing shows "Log In" and "Sign Up" buttons
- [ ] URL bar shows `/landing`

### Test 2: Login Flow
- [ ] From Landing, click "Log In"
- [ ] Redirects to Base44 auth page
- [ ] Complete login
- [ ] Redirects to `/home` dashboard
- [ ] Can access all protected routes (Portfolio, AI Coach, etc.)

### Test 3: Protected Route Access (Logged Out)
- [ ] In incognito window, manually navigate to `/portfolio`
- [ ] Should redirect to auth page
- [ ] Complete login
- [ ] Should redirect back to `/portfolio` (returnTo functionality)

### Test 4: Landing Accessibility (Logged In)
- [ ] While logged in, navigate to `/landing`
- [ ] Landing page loads successfully
- [ ] Shows "Go to Dashboard" button instead of "Log In"
- [ ] Can navigate to protected routes from there

### Test 5: Splash Behavior
- [ ] Navigate to `/splash` manually
- [ ] Splash shows for ~1.2s
- [ ] Auto-redirects to `/landing`
- [ ] Works same way logged in or logged out

## Troubleshooting

### Issue: Stuck on auth redirect
**Solution**: Check that `PUBLIC_PAGES` array in Layout includes 'Splash' and 'Landing'

### Issue: returnTo not working
**Solution**: Verify `base44.auth.redirectToLogin()` is being called with proper return URL encoding

### Issue: Landing page requires auth
**Solution**: Ensure Landing component doesn't call `base44.auth.me()` in a way that throws on failure

### Issue: Infinite redirect loop
**Solution**: Make sure auth check in Layout is skipped for public pages using `isPublicPage` condition

## Security Notes

- Authentication is enforced at the layout level for protected pages
- Base44 handles all authentication logic and session management
- JWT tokens are managed by Base44 SDK automatically
- No sensitive data should be rendered on public pages
- All API calls from protected routes automatically include auth tokens

## Future Enhancements

1. **Route Guards**: Create a more robust route guard system with role-based access
2. **Prefetching**: Prefetch user data on Splash to reduce loading on protected routes
3. **Analytics**: Track conversion from Landing → Sign Up
4. **A/B Testing**: Test different Landing page variants
5. **Deep Linking**: Support deep links with authentication state preservation