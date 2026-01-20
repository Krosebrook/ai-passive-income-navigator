# Deployment Guide

## Overview

This guide covers deploying the AI Passive Income Navigator to production and managing different environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Deployment Options](#deployment-options)
- [Base44 Deployment](#base44-deployment)
- [Vercel Deployment](#vercel-deployment)
- [Netlify Deployment](#netlify-deployment)
- [Custom Server Deployment](#custom-server-deployment)
- [Environment Management](#environment-management)
- [Post-Deployment](#post-deployment)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Git repository access
- [ ] Base44 account and app configured
- [ ] Environment variables configured
- [ ] Authentication enabled (`requiresAuth: true`)
- [ ] Security vulnerabilities fixed (`npm audit fix`)
- [ ] Tests passing (`npm test`)
- [ ] Build successful (`npm run build`)

## Environment Configuration

### Environment Variables

Create environment-specific `.env` files:

**.env.development**
```bash
VITE_BASE44_APP_ID=dev_app_id
VITE_BASE44_APP_BASE_URL=https://dev-app.base44.app
VITE_ENABLE_BETA_FEATURES=true
```

**.env.staging**
```bash
VITE_BASE44_APP_ID=staging_app_id
VITE_BASE44_APP_BASE_URL=https://staging-app.base44.app
VITE_ENABLE_BETA_FEATURES=true
```

**.env.production**
```bash
VITE_BASE44_APP_ID=prod_app_id
VITE_BASE44_APP_BASE_URL=https://app.base44.app
VITE_ENABLE_BETA_FEATURES=false
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_ANALYTICS_ID=your_analytics_id
```

## Deployment Options

### Option 1: Base44 Platform (Recommended)

**Pros:**
- Integrated with Base44 backend
- Automatic deployments on git push
- Built-in preview environments
- Easy rollback

**Cons:**
- Tied to Base44 platform
- Less control over infrastructure

### Option 2: Vercel

**Pros:**
- Fast global CDN
- Automatic HTTPS
- Easy setup
- Great developer experience

**Cons:**
- Additional service to manage
- Costs for high traffic

### Option 3: Netlify

**Pros:**
- Similar to Vercel
- Good free tier
- Form handling built-in

**Cons:**
- Additional service to manage

### Option 4: Custom Server

**Pros:**
- Full control
- Custom configurations

**Cons:**
- More maintenance
- Need to manage infrastructure

## Base44 Deployment

### Step 1: Configure Base44

1. Log in to [Base44.com](https://base44.com)
2. Navigate to your app
3. Connect your Git repository
4. Configure build settings

### Step 2: Build Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### Step 3: Deploy

```bash
# Commit your changes
git add .
git commit -m "Deploy to production"
git push origin main

# Base44 will automatically build and deploy
```

### Step 4: Verify Deployment

1. Check build logs in Base44 dashboard
2. Test the deployed application
3. Monitor for errors

## Vercel Deployment

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Configure Project

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 4: Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 5: Configure Environment Variables

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Redeploy

## Netlify Deployment

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login

```bash
netlify login
```

### Step 3: Configure

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### Step 4: Deploy

```bash
# Deploy to draft
netlify deploy

# Deploy to production
netlify deploy --prod
```

## Custom Server Deployment

### Using Nginx

1. **Build the application:**
```bash
npm run build
```

2. **Copy build to server:**
```bash
scp -r dist/* user@server:/var/www/app/
```

3. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

4. **Enable HTTPS:**
```bash
sudo certbot --nginx -d yourdomain.com
```

### Using Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t ai-passive-income-nav .
docker run -p 80:80 ai-passive-income-nav
```

## Environment Management

### Development Environment

```bash
# Run locally
npm run dev

# Access at http://localhost:5173
```

### Staging Environment

```bash
# Build with staging config
npm run build -- --mode staging

# Deploy to staging
vercel --env=staging
```

### Production Environment

```bash
# Build for production
npm run build -- --mode production

# Deploy to production
vercel --prod
```

## Post-Deployment

### Checklist

- [ ] Verify application loads correctly
- [ ] Test authentication flow
- [ ] Check all pages and features
- [ ] Verify API connections
- [ ] Test on mobile devices
- [ ] Check browser console for errors
- [ ] Verify analytics tracking
- [ ] Test error tracking (trigger a test error)
- [ ] Check performance metrics
- [ ] Verify SEO meta tags

### Monitoring Setup

1. **Error Tracking (Sentry):**
```bash
npm install @sentry/react @sentry/vite-plugin
```

Configure in `main.jsx`:
```javascript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

2. **Analytics (Plausible):**
```html
<!-- Add to index.html -->
<script defer data-domain="yourdomain.com" 
  src="https://plausible.io/js/script.js"></script>
```

3. **Performance Monitoring:**
- Use Lighthouse for audits
- Monitor Core Web Vitals
- Set up uptime monitoring

## Rollback Procedures

### Base44 Rollback

1. Go to Base44 dashboard
2. Navigate to Deployments
3. Click "Rollback" on previous version

### Vercel Rollback

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote [deployment-url]
```

### Git Rollback

```bash
# Revert to previous commit
git revert HEAD

# Or reset to specific commit
git reset --hard [commit-hash]
git push -f origin main
```

### Manual Rollback

1. Keep previous build artifacts
2. Restore previous `dist` folder
3. Redeploy

## Troubleshooting

### Build Failures

**Issue:** Build fails with dependency errors
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Issue:** Environment variables not found
```bash
# Solution: Verify .env files are loaded
echo $VITE_BASE44_APP_ID
```

### Runtime Errors

**Issue:** Blank page after deployment
- Check browser console for errors
- Verify base path configuration
- Check network tab for failed requests

**Issue:** API requests failing
- Verify CORS configuration
- Check API endpoint URLs
- Verify authentication tokens

### Performance Issues

**Issue:** Slow initial load
- Enable code splitting
- Optimize bundle size
- Use CDN for assets

**Issue:** High bandwidth usage
- Enable compression (gzip/brotli)
- Optimize images
- Implement caching headers

### Common Errors

1. **404 on refresh:**
   - Add SPA rewrite rules
   - Configure server to serve index.html for all routes

2. **CORS errors:**
   - Configure Base44 CORS settings
   - Check API URL configuration

3. **Build size too large:**
   - Analyze bundle with `npm run build -- --report`
   - Remove unused dependencies
   - Implement code splitting

## Security Checklist

Before production deployment:

- [ ] Enable authentication (`requiresAuth: true`)
- [ ] Run `npm audit fix`
- [ ] Enable HTTPS only
- [ ] Set secure HTTP headers
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Sanitize user inputs
- [ ] Review API permissions
- [ ] Add content security policy
- [ ] Enable logging and monitoring

## Performance Optimization

Pre-deployment optimizations:

- [ ] Minimize bundle size
- [ ] Optimize images
- [ ] Enable lazy loading
- [ ] Implement code splitting
- [ ] Add service worker for caching
- [ ] Use CDN for static assets
- [ ] Enable compression
- [ ] Optimize fonts
- [ ] Reduce third-party scripts

## Related Documentation

- [Architecture Documentation](../ARCHITECTURE.md)
- [Development Guide](./DEVELOPMENT.md)
- [Testing Guide](./TESTING.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-19  
**Maintained by**: Development Team
