# Architecture Documentation

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [State Management](#state-management)
- [API Design](#api-design)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Design Decisions](#design-decisions)

## Overview

The AI Passive Income Navigator is a single-page application (SPA) built with React that helps users discover, track, and manage passive income opportunities. The application leverages AI-powered insights and is built on the Base44 platform for backend services.

### Key Characteristics

- **Type**: Single Page Application (SPA)
- **Architecture Pattern**: Component-based with feature modules
- **Rendering**: Client-side rendering (CSR)
- **State Management**: React Query (TanStack Query) for server state, React hooks for local state
- **Backend**: Base44 Platform (BaaS - Backend as a Service)
- **Deployment**: Static hosting with CDN

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │           React Application (Vite)                │  │
│  │  ┌──────────────┐  ┌──────────────┐              │  │
│  │  │  Components  │  │    Hooks     │              │  │
│  │  └──────────────┘  └──────────────┘              │  │
│  │  ┌──────────────┐  ┌──────────────┐              │  │
│  │  │ React Query  │  │   Routing    │              │  │
│  │  └──────────────┘  └──────────────┘              │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │ HTTPS/REST API
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Base44 Platform                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Authentication  │  Database  │  Cloud Functions  │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │   AI Agents   │  File Storage  │   Integrations   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Architecture Layers

1. **Presentation Layer** (React Components)
   - UI components (Shadcn/ui, Radix UI)
   - Page components
   - Layout components

2. **Business Logic Layer** (Hooks & Utils)
   - Custom React hooks
   - Business logic functions
   - Data transformations

3. **Data Access Layer** (API Client)
   - Base44 SDK client
   - React Query for caching and state
   - API request/response handling

4. **Backend Services** (Base44 Platform)
   - Authentication & Authorization
   - Database (Collections)
   - Cloud Functions (Serverless)
   - AI Agents

## Technology Stack

### Frontend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | React | 18.2.0 | UI framework |
| Build Tool | Vite | 6.1.0 | Build and dev server |
| Language | JavaScript | ES2022+ | Programming language |
| Styling | Tailwind CSS | 3.4.17 | Utility-first CSS |
| UI Components | Shadcn/ui + Radix UI | Latest | Component library |
| State Management | TanStack Query | 5.84.1 | Server state management |
| Forms | React Hook Form | 7.54.2 | Form handling |
| Validation | Zod | 3.24.2 | Schema validation |
| Routing | React Router | 6.26.0 | Client-side routing |
| Charts | Recharts | 2.15.4 | Data visualization |
| Animations | Framer Motion | 11.16.4 | Animation library |

### Backend (Base44 Platform)

| Service | Purpose |
|---------|---------|
| Authentication | User authentication and authorization |
| Database | NoSQL document database (collections) |
| Cloud Functions | Serverless functions for business logic |
| AI Agents | AI-powered features and insights |
| File Storage | Asset and document storage |

### Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Vitest | Unit testing |
| Testing Library | Component testing |
| GitHub Actions | CI/CD pipeline |

## Component Architecture

### Component Organization

```
src/
├── components/
│   ├── ui/                    # Base UI components (buttons, inputs, etc.)
│   ├── ideas/                 # Idea-related components
│   ├── portfolio/             # Portfolio management components
│   ├── dashboard/             # Dashboard and analytics
│   ├── ai/                    # AI chat and guidance
│   ├── community/             # Community features
│   ├── trends/                # Market trends
│   ├── onboarding/            # User onboarding
│   ├── analytics/             # Analytics components
│   ├── deals/                 # Deal pipeline
│   ├── finance/               # Financial tools
│   ├── market/                # Market data
│   └── [other features]/      # Other feature modules
├── pages/                     # Page components (routes)
├── hooks/                     # Custom React hooks
├── lib/                       # Utilities and helpers
├── api/                       # API client configuration
└── utils/                     # Utility functions
```

### Component Types

1. **Page Components** (`src/pages/`)
   - Route-level components
   - Compose feature components
   - Handle page-level state and effects

2. **Feature Components** (`src/components/[feature]/`)
   - Feature-specific business logic
   - Compose UI components
   - Handle feature-level state

3. **UI Components** (`src/components/ui/`)
   - Reusable, generic components
   - Presentational only
   - No business logic

4. **Layout Components**
   - App-level layout
   - Navigation
   - Common UI patterns

### Component Patterns

- **Functional Components**: All components are functional with hooks
- **Composition over Inheritance**: Components are composed, not extended
- **Single Responsibility**: Each component has one clear purpose
- **Props Interface**: Clear, typed prop interfaces
- **Custom Hooks**: Extract reusable logic into custom hooks

## Data Flow

### Request Flow

```
User Interaction
    │
    ▼
React Component
    │
    ▼
Event Handler
    │
    ▼
React Query Hook (useMutation/useQuery)
    │
    ▼
Base44 SDK Client
    │
    ▼
Base44 API (HTTPS)
    │
    ▼
Base44 Backend Services
    │
    ├─► Database
    ├─► Cloud Functions
    └─► AI Agents
    │
    ▼
Response (JSON)
    │
    ▼
React Query Cache
    │
    ▼
Component Re-render
    │
    ▼
UI Update
```

### State Flow

1. **Server State** (React Query)
   - Data from API
   - Automatically cached
   - Background refresh
   - Optimistic updates

2. **Local State** (useState)
   - Component-specific state
   - Form inputs
   - UI interactions

3. **URL State** (React Router)
   - Current route
   - Query parameters
   - Navigation state

## State Management

### React Query (TanStack Query)

Used for all server state management:

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['ideas'],
  queryFn: () => base44.ideas.list()
});

// Mutating data
const mutation = useMutation({
  mutationFn: (newIdea) => base44.ideas.create(newIdea),
  onSuccess: () => {
    queryClient.invalidateQueries(['ideas']);
  }
});
```

### Local State (React Hooks)

Used for component-specific state:

```javascript
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({});
```

### State Principles

- **Server state** managed by React Query
- **Local UI state** managed by useState
- **Derived state** computed from existing state
- **Minimal state** - avoid duplication
- **Single source of truth** for each piece of state

## API Design

### Base44 SDK

The application uses the Base44 SDK for all API communication:

```javascript
// src/api/base44Client.js
import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: process.env.VITE_BASE44_APP_ID,
  token: process.env.VITE_BASE44_TOKEN,
  requiresAuth: false, // Should be true in production
  appBaseUrl: process.env.VITE_BASE44_APP_BASE_URL
});
```

### Data Collections

Main collections in the Base44 database:

- **ideas** - Passive income ideas/opportunities
- **portfolioItems** - User's portfolio items
- **bookmarks** - User's saved ideas
- **preferences** - User preferences and settings
- **marketData** - Market trends and data
- **communityPosts** - Community discussions
- **comments** - User comments
- **analytics** - User analytics data

### Cloud Functions

Serverless functions in the `functions/` directory:

- `generateIdeas` - AI-powered idea generation
- `analyzeMarketTrends` - Market trend analysis
- `generateRecommendations` - Personalized recommendations
- `analyzeIdeaViability` - Idea validation
- `generatePersonalizedRoadmap` - User roadmap generation
- [70+ other functions for various features]

## Security Architecture

### Authentication Flow

```
User Login
    │
    ▼
Base44 Auth
    │
    ├─► Validate Credentials
    │
    ▼
JWT Token
    │
    ├─► Store in Memory/LocalStorage
    │
    ▼
Subsequent Requests
    │
    ├─► Include JWT in Headers
    │
    ▼
Base44 API
    │
    ├─► Validate Token
    ├─► Check Permissions
    │
    ▼
Access Granted/Denied
```

### Security Layers

1. **Authentication** (Base44 Auth)
   - User login/signup
   - JWT token management
   - Session handling

2. **Authorization** (Base44 Permissions)
   - Role-based access control
   - Resource permissions
   - User-specific data access

3. **Input Validation** (Zod schemas)
   - Form validation
   - API request validation
   - Type safety

4. **API Security**
   - HTTPS only
   - CORS configuration
   - Rate limiting (Base44)

### Current Security Concerns

⚠️ **Critical Issues** (Must fix before production):

1. Authentication disabled (`requiresAuth: false`)
2. No input sanitization
3. 11 npm security vulnerabilities
4. Missing rate limiting
5. No CSRF protection

See [SECURITY_RECOMMENDATIONS.md](./SECURITY_RECOMMENDATIONS.md) for details.

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────┐
│                    CDN (Cloudflare)                  │
│              ┌────────────────────────┐              │
│              │   Static Assets Cache  │              │
│              └────────────────────────┘              │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│            Static Hosting (Vercel/Netlify)           │
│              ┌────────────────────────┐              │
│              │   Built React App      │              │
│              │   (HTML, JS, CSS)      │              │
│              └────────────────────────┘              │
└─────────────────────────────────────────────────────┘
                         │
                         │ API Calls
                         ▼
┌─────────────────────────────────────────────────────┐
│                  Base44 Platform                     │
│              ┌────────────────────────┐              │
│              │   Backend Services     │              │
│              └────────────────────────┘              │
└─────────────────────────────────────────────────────┘
```

### Deployment Process

1. **Build**: `npm run build` - Creates optimized production build
2. **Deploy**: Push to Git → Automatic deployment via CI/CD
3. **Publish**: Base44 Builder or hosting platform deploys to CDN

### Environments

- **Development**: Local Vite dev server (`npm run dev`)
- **Staging**: Test deployment with staging Base44 app
- **Production**: Production deployment with production Base44 app

## Design Decisions

### Why React?

- Large ecosystem and community
- Component-based architecture
- Virtual DOM for performance
- Hooks for cleaner code
- Strong tooling support

### Why Vite?

- Fast development server with HMR
- Optimized production builds
- Modern ES modules
- Better performance than webpack

### Why Base44 Platform?

- Rapid prototyping
- Backend services out of the box
- Scalable infrastructure
- Built-in authentication
- AI agent capabilities
- Reduced development time

### Why Tailwind CSS?

- Utility-first approach
- Consistent design system
- Fast development
- Small production bundle
- Easy customization

### Why React Query?

- Automatic caching
- Background refetching
- Optimistic updates
- Request deduplication
- Built-in loading states
- Better than Redux for server state

### Why Monolithic Frontend?

**Current**: Single React app
**Future**: Consider micro-frontends if:
- Team grows significantly
- Multiple independent features
- Need for independent deployments

Currently, monolithic is appropriate for:
- Small to medium team
- Cohesive feature set
- Shared UI components
- Faster development

## Performance Considerations

### Current Optimizations

- Code splitting by route
- Lazy loading of components
- Image optimization
- React.memo for expensive renders
- useCallback/useMemo where needed

### Future Optimizations

- Server-side rendering (SSR) or Static Site Generation (SSG)
- Service worker for offline support
- IndexedDB for local caching
- Web Workers for heavy computations
- Bundle size optimization

## Scalability Considerations

### Current Capacity

- Suitable for: 1-10K users
- Performance: Good for prototype
- Limitations: Client-side rendering

### Scaling Strategy

**Short-term** (1-10K users):
- Current architecture sufficient
- Optimize bundle size
- Add CDN caching

**Mid-term** (10K-100K users):
- Add monitoring and analytics
- Implement service worker
- Optimize database queries
- Add rate limiting

**Long-term** (100K+ users):
- Consider SSR/SSG
- Implement micro-frontends
- Add dedicated API layer
- Scale Base44 plan
- Add load balancing

## Monitoring and Observability

### Current State

⚠️ **No monitoring in place** - Critical gap

### Recommended Tools

- **Error Tracking**: Sentry
- **Analytics**: Plausible or Google Analytics
- **Performance**: Lighthouse, Web Vitals
- **Logging**: Base44 logs + custom logging

See [TECHNICAL_RECOMMENDATIONS.md](./TECHNICAL_RECOMMENDATIONS.md) for implementation.

## Future Architecture Considerations

### Potential Migrations

1. **TypeScript Migration**
   - Add type safety
   - Better IDE support
   - Catch errors early

2. **Micro-frontends**
   - Independent teams
   - Independent deployments
   - Technology flexibility

3. **Server-Side Rendering**
   - Better SEO
   - Faster initial load
   - Better for content-heavy pages

4. **GraphQL API**
   - More efficient data fetching
   - Better API documentation
   - Strongly typed queries

### When to Consider Changes

- TypeScript: Now (low risk, high value)
- Micro-frontends: When team > 10 developers
- SSR: When SEO becomes critical
- GraphQL: When REST API becomes complex

## Related Documentation

- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Technical Recommendations](./TECHNICAL_RECOMMENDATIONS.md)
- [Security Recommendations](./SECURITY_RECOMMENDATIONS.md)
- [Development Guide](./docs/DEVELOPMENT.md)

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-19  
**Maintained by**: Development Team
