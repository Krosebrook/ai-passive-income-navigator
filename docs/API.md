# API Documentation

## Overview

The AI Passive Income Navigator uses the Base44 Platform for backend services. This document describes the API structure, available endpoints, and how to interact with the system.

## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Data Collections](#data-collections)
- [Cloud Functions](#cloud-functions)
- [API Examples](#api-examples)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Authentication

### Configuration

```javascript
// src/api/base44Client.js
import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: process.env.VITE_BASE44_APP_ID,
  token: process.env.VITE_BASE44_TOKEN,
  requiresAuth: true, // Enable authentication
  appBaseUrl: process.env.VITE_BASE44_APP_BASE_URL
});
```

### Authentication Flow

1. User logs in via Base44 Auth
2. JWT token is stored in memory/localStorage
3. Token is automatically included in all API requests
4. Token expires after configured duration
5. Refresh token used to get new access token

### Required Environment Variables

```bash
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

## Base URL

All API requests are made through the Base44 SDK, which handles the base URL configuration.

```
Production: https://your-app.base44.app
Development: https://your-dev-app.base44.app
```

## Data Collections

### Ideas Collection

Stores passive income ideas and opportunities.

**Operations:**
```javascript
// List all ideas
const ideas = await base44.ideas.list();

// Get single idea
const idea = await base44.ideas.get(ideaId);

// Create new idea
const newIdea = await base44.ideas.create({
  title: 'E-commerce Store',
  description: 'Launch an online store',
  category: 'E-commerce',
  difficulty: 'intermediate'
});

// Update idea
const updated = await base44.ideas.update(ideaId, { title: 'Updated Title' });

// Delete idea
await base44.ideas.delete(ideaId);
```

### Portfolio Items Collection

Tracks user's portfolio of passive income projects.

**Operations:**
```javascript
// List user's portfolio
const portfolio = await base44.portfolioItems.list();

// Create portfolio item
const newItem = await base44.portfolioItems.create({
  ideaId: 'idea-123',
  status: 'planning',
  revenue: 0
});

// Update portfolio item
const updated = await base44.portfolioItems.update(itemId, {
  status: 'in-progress',
  revenue: 500
});
```

### Bookmarks Collection

Stores user's bookmarked ideas.

**Operations:**
```javascript
// List bookmarks
const bookmarks = await base44.bookmarks.list();

// Create bookmark
const bookmark = await base44.bookmarks.create({
  ideaId: 'idea-123',
  notes: 'Interesting opportunity'
});

// Delete bookmark
await base44.bookmarks.delete(bookmarkId);
```

## Cloud Functions

Cloud functions are serverless functions in the `functions/` directory.

### Key AI-Powered Functions

- `generateIdeas` - AI-powered idea generation
- `analyzeMarketTrends` - Market trend analysis
- `generateRecommendations` - Personalized recommendations
- `analyzeIdeaViability` - Idea validation
- `generatePersonalizedRoadmap` - User roadmap generation

See individual function files for detailed documentation.

## API Examples

### Using React Query

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Query Example
function useIdeas() {
  return useQuery({
    queryKey: ['ideas'],
    queryFn: () => base44.ideas.list(),
    staleTime: 5 * 60 * 1000,
  });
}

// Mutation Example
function useCreatePortfolioItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => base44.portfolioItems.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['portfolioItems']);
    },
  });
}
```

## Error Handling

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_REQUIRED` | Authentication required | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

### Error Handling Example

```javascript
async function createIdea(data) {
  try {
    const idea = await base44.ideas.create(data);
    return { success: true, data: idea };
  } catch (error) {
    if (error.code === 'AUTH_REQUIRED') {
      window.location.href = '/login';
    } else if (error.code === 'VALIDATION_ERROR') {
      return { success: false, errors: error.details };
    }
    return { success: false, error: error.message };
  }
}
```

## Rate Limiting

### Current Limits

- **API Requests**: 100 requests per minute
- **Cloud Functions**: 10 requests per minute per function
- **File Uploads**: 10 uploads per minute

## Best Practices

1. **Always Handle Errors** - Gracefully handle all error cases
2. **Use Query Keys Consistently** - Maintain consistent query key naming
3. **Implement Optimistic Updates** - Better UX with instant feedback
4. **Cache Strategically** - Balance freshness and performance
5. **Use TypeScript** - Type safety for API interactions

## Related Documentation

- [Architecture Documentation](../ARCHITECTURE.md)
- [Development Guide](./DEVELOPMENT.md)
- [Testing Guide](./TESTING.md)

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-19
