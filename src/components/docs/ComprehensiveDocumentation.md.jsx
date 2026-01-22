# FlashFusion Documentation

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Platform:** Web Application (React + Base44 Backend)

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [User Guide](#user-guide)
4. [Developer Guide](#developer-guide)
5. [API Reference](#api-reference)
6. [Architecture](#architecture)
7. [Deployment & Operations](#deployment--operations)
8. [Testing & Quality](#testing--quality)
9. [Security & Compliance](#security--compliance)
10. [Troubleshooting](#troubleshooting)
11. [Changelog](#changelog)
12. [Appendices](#appendices)

---

## Overview

### What is FlashFusion?

FlashFusion is an AI-powered investment intelligence platform designed to help users discover, analyze, and manage passive income opportunities. The platform combines advanced AI capabilities with comprehensive portfolio management tools to provide personalized investment recommendations and market insights.

### Key Features

- **AI Deal Sourcing**: Automated discovery of investment opportunities across multiple industries
- **Predictive Analytics**: ROI forecasting, sentiment analysis, and risk assessment
- **Portfolio Management**: Real-time tracking, performance visualization, and rebalancing recommendations
- **Market Intelligence**: Live market data feeds and trend analysis
- **Community Features**: Forums, success stories, and collaboration tools
- **Gamification**: Points, badges, and leaderboards to drive engagement
- **Adaptive Onboarding**: Personalized user onboarding based on goals and preferences

### Technology Stack

- **Frontend**: React 18.2, Tailwind CSS, Framer Motion
- **Backend**: Base44 BaaS, Deno Deploy (serverless functions)
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI, shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React

### Supported Platforms

- Modern web browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (iOS Safari, Chrome Mobile)
- Progressive Web App (PWA) support

---

## Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Modern web browser
- Base44 account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/flashfusion.git
   cd flashfusion
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Configure environment variables**
   ```bash
   # Set up your Base44 credentials
   # These are managed through the Base44 dashboard
   BASE44_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Access the application**
   - Open http://localhost:5173 in your browser
   - Create an account or sign in

### First Run Checklist

- [ ] Complete user registration
- [ ] Go through adaptive onboarding flow
- [ ] Set investment preferences
- [ ] Connect first external account (optional)
- [ ] Explore AI-generated deal opportunities
- [ ] Save your first investment to portfolio

---

## User Guide

### Getting Started as a User

#### 1. Registration & Onboarding

**Adaptive Onboarding Flow:**
- Select your primary goal (passive income, capital growth, learning, exploring)
- Answer preference questions (risk tolerance, time commitment, target industries)
- Complete quick profile setup
- Get personalized recommendations

**Outcome-Based Paths:**
- **Passive Income**: Focus on revenue-generating opportunities
- **Capital Growth**: Emphasis on appreciation potential
- **Learn Deals**: Educational resources and guided experiences
- **Explore Only**: Flexible browsing mode

#### 2. Dashboard Navigation

**Main Navigation:**
- **Home**: Overview dashboard with key metrics
- **Portfolio**: Investment tracking and management
- **AI Coach**: Personalized investment advice and insights
- **Pipeline**: Deal sourcing and opportunity management
- **Preferences**: User settings and preferences
- **Community**: Forums and success stories

#### 3. Using AI Deal Sourcing

**Discovering Opportunities:**
1. Navigate to Pipeline or Home dashboard
2. View AI-sourced deal opportunities
3. Review key metrics (ROI, risk score, match score)
4. Click "AI Due Diligence" for deep analysis

**Deal Analysis Features:**
- ROI forecast (conservative, expected, optimistic)
- Sentiment analysis from news and social media
- Comprehensive risk assessment with red flags
- Actionable steps and mitigation strategies

**Taking Action:**
- Save deals to pipeline
- Dismiss irrelevant opportunities
- Provide feedback to improve AI matching
- View source information

#### 4. Portfolio Management

**Tracking Investments:**
- View total portfolio value and ROI
- Monitor individual investment performance
- Track historical performance over time
- Visualize allocation by industry and asset type

**External Account Integration:**
- Connect brokerage accounts (Plaid integration)
- Sync bank accounts
- Aggregate crypto wallets
- Manual account entry

**Rebalancing:**
1. Navigate to Portfolio → Rebalancing tab
2. Click "Generate Recommendations"
3. Review AI-powered suggestions
4. View expected improvements
5. Implement changes

#### 5. Gamification & Progress

**Earning Points:**
- Complete onboarding: 100 points
- Source a deal: 25 points
- Save a deal: 10 points
- Close a deal: 100 points
- Daily login: 5 points
- Complete analysis: 15 points

**Badges & Achievements:**
- First Deal Badge
- Portfolio Builder
- Risk Master
- Community Champion
- Market Maven

**Leaderboards:**
- View top performers
- Compare metrics (points, deals closed, ROI)
- Track your rank

#### 6. Community Features

**Forums:**
- Ask questions and get answers
- Share insights and strategies
- Rate helpful responses
- Follow trending discussions

**Success Stories:**
- Read real user experiences
- Submit your own story
- Filter by category and industry

---

## Developer Guide

### Project Structure

```
flashfusion/
├── src/
│   ├── pages/              # Page components (routes)
│   │   ├── Home.js
│   │   ├── Portfolio.js
│   │   ├── DealPipeline.js
│   │   └── ...
│   ├── components/         # Reusable components
│   │   ├── ui/            # Base UI components
│   │   ├── deals/         # Deal-related components
│   │   ├── portfolio/     # Portfolio components
│   │   ├── onboarding/    # Onboarding flows
│   │   ├── gamification/  # Points, badges, leaderboards
│   │   └── ...
│   ├── functions/         # Backend serverless functions
│   │   ├── forecastDealROI.js
│   │   ├── analyzeSentiment.js
│   │   ├── generateRiskAssessment.js
│   │   └── ...
│   ├── entities/          # Database entity schemas
│   │   ├── Investment.json
│   │   ├── SourcedDealOpportunity.json
│   │   └── ...
│   ├── agents/            # AI agent configurations
│   └── Layout.js          # Main layout wrapper
├── public/                # Static assets
├── package.json
└── vite.config.js
```

### Component Architecture

#### Page Components

Pages are flat (no subfolders) and serve as route entry points:

```jsx
// pages/Portfolio.js
import React from 'react';
import { base44 } from '@/api/base44Client';

export default function Portfolio() {
  // Page logic
  return <div>Portfolio content</div>;
}
```

**Rules:**
- Must export default component with same name as file
- No nested page folders allowed
- Use components for complex UI

#### Reusable Components

Components can be organized in subfolders:

```jsx
// components/portfolio/PortfolioCard.jsx
export default function PortfolioCard({ investment }) {
  return (
    <Card>
      {/* Component content */}
    </Card>
  );
}
```

#### Layout Component

The Layout wraps all pages:

```jsx
// Layout.js
export default function Layout({ children, currentPageName }) {
  return (
    <div>
      <Navigation currentPage={currentPageName} />
      {children}
      <Footer />
    </div>
  );
}
```

### State Management

#### Using React Query

```jsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['investments'],
  queryFn: () => base44.entities.Investment.list()
});

// Mutations
const createMutation = useMutation({
  mutationFn: (data) => base44.entities.Investment.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['investments'] });
  }
});
```

### Working with Entities

#### Entity Schema Definition

```json
// entities/Investment.json
{
  "name": "Investment",
  "type": "object",
  "properties": {
    "investment_name": { "type": "string" },
    "initial_investment": { "type": "number" },
    "current_value": { "type": "number" }
  },
  "required": ["investment_name", "initial_investment"]
}
```

#### CRUD Operations

```javascript
// Create
const investment = await base44.entities.Investment.create({
  investment_name: "Tech Startup",
  initial_investment: 10000
});

// Read
const investments = await base44.entities.Investment.list();
const filtered = await base44.entities.Investment.filter({ status: 'active' });

// Update
await base44.entities.Investment.update(id, { current_value: 12000 });

// Delete
await base44.entities.Investment.delete(id);
```

### Backend Functions

#### Function Structure

```javascript
// functions/forecastDealROI.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deal_id } = await req.json();
    
    // Function logic here
    
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

#### Calling Functions from Frontend

```javascript
import { base44 } from '@/api/base44Client';

const response = await base44.functions.invoke('forecastDealROI', {
  deal_id: 'deal_123'
});

console.log(response.data);
```

#### Using LLM Integration

```javascript
const analysis = await base44.integrations.Core.InvokeLLM({
  prompt: "Analyze this investment opportunity...",
  add_context_from_internet: true,
  response_json_schema: {
    type: 'object',
    properties: {
      roi_forecast: { type: 'number' },
      risk_level: { type: 'string' }
    }
  }
});
```

### Styling Guidelines

#### Brand Colors

```css
/* Primary Colors */
--primary: #8b85f7;        /* Purple */
--primary-dark: #583cf0;   /* Deep Purple */
--secondary: #00b7eb;      /* Cyan */
--accent: #ff8e42;         /* Orange */
--accent-pink: #ff69b4;    /* Pink */

/* Backgrounds */
--bg-dark: #0f0618;
--bg-darker: #1a0f2e;
--surface: #2d1e50;
```

#### Gradient Usage

```jsx
// Text gradient
<h1 className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] bg-clip-text text-transparent">
  Title
</h1>

// Background gradient
<div className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0]">
  Content
</div>
```

#### Component Styling

```jsx
// Card styling
<Card className="card-dark">  // bg-[#1a0f2e] with borders

// Button variants
<Button className="btn-primary">  // Purple gradient
<Button className="btn-secondary">  // Cyan
<Button className="btn-ghost">  // Transparent with hover
```

### Creating New Features

#### Step-by-Step Process

1. **Define Entity (if needed)**
   ```bash
   # Create entities/MyEntity.json
   ```

2. **Create Backend Function (if needed)**
   ```bash
   # Create functions/myFunction.js
   ```

3. **Build UI Components**
   ```bash
   # Create components/feature/MyComponent.jsx
   ```

4. **Create Page (if needed)**
   ```bash
   # Create pages/MyPage.js
   ```

5. **Add Navigation Link**
   ```javascript
   // Update Layout.js NAV_ITEMS
   ```

---

## API Reference

### Base44 SDK

#### Authentication

```javascript
// Get current user
const user = await base44.auth.me();

// Update user data
await base44.auth.updateMe({ full_name: "John Doe" });

// Logout
base44.auth.logout();

// Check authentication status
const isAuth = await base44.auth.isAuthenticated();
```

#### Entity Operations

```javascript
// List all records
const records = await base44.entities.EntityName.list();

// List with sorting and limit
const sorted = await base44.entities.EntityName.list('-created_date', 10);

// Filter records
const filtered = await base44.entities.EntityName.filter({
  status: 'active',
  user_email: user.email
});

// Get single record
const record = await base44.entities.EntityName.get(id);

// Create record
const newRecord = await base44.entities.EntityName.create(data);

// Bulk create
await base44.entities.EntityName.bulkCreate([data1, data2]);

// Update record
await base44.entities.EntityName.update(id, { field: value });

// Delete record
await base44.entities.EntityName.delete(id);

// Get entity schema
const schema = await base44.entities.EntityName.schema();
```

#### Real-time Subscriptions

```javascript
const unsubscribe = base44.entities.EntityName.subscribe((event) => {
  console.log(event.type); // 'create', 'update', 'delete'
  console.log(event.data); // Current entity data
  console.log(event.id);   // Entity ID
});

// Cleanup
unsubscribe();
```

#### Integrations

```javascript
// Invoke LLM
const response = await base44.integrations.Core.InvokeLLM({
  prompt: "Your prompt here",
  add_context_from_internet: true,
  response_json_schema: { /* schema */ }
});

// Send Email
await base44.integrations.Core.SendEmail({
  to: "user@example.com",
  subject: "Subject",
  body: "Email body"
});

// Upload File
const { file_url } = await base44.integrations.Core.UploadFile({
  file: fileObject
});

// Generate Image
const { url } = await base44.integrations.Core.GenerateImage({
  prompt: "A futuristic dashboard"
});
```

#### Analytics

```javascript
base44.analytics.track({
  eventName: 'deal_saved',
  properties: {
    deal_id: 'deal_123',
    match_score: 85
  }
});
```

### Backend Function Endpoints

| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `forecastDealROI` | Predict ROI based on historical data | `{ deal_id }` | ROI forecast with confidence |
| `analyzeSentiment` | News/social media sentiment analysis | `{ deal_id, company_name, industry }` | Sentiment score and insights |
| `generateRiskAssessment` | Comprehensive risk analysis | `{ deal_id }` | Risk factors, red flags, mitigation |
| `generateRebalancingRecommendations` | Portfolio rebalancing advice | `{}` | Rebalancing actions and targets |
| `sourceDealOpportunities` | AI deal sourcing | `{}` | New deal opportunities |
| `performDealDueDiligence` | Deep deal analysis | `{ deal_id }` | Due diligence report |
| `awardPoints` | Gamification points | `{ user_email, event_type, points }` | Updated point total |
| `checkAndAwardBadges` | Badge achievements | `{ user_email }` | Newly earned badges |
| `getLeaderboard` | User rankings | `{ metric, limit }` | Top users by metric |

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface (React)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Home   │ │Portfolio │ │   Deal   │ │   AI     │      │
│  │          │ │Management│ │ Pipeline │ │  Coach   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Base44 SDK
                         │
┌────────────────────────┴────────────────────────────────────┐
│                  Base44 Backend (BaaS)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Entity Management                        │  │
│  │  (Investments, Deals, Users, Preferences, etc.)      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Serverless Functions (Deno)                │  │
│  │  • ROI Forecasting  • Sentiment Analysis             │  │
│  │  • Risk Assessment  • Deal Sourcing                  │  │
│  │  • Rebalancing      • Gamification                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Integrations                             │  │
│  │  • LLM (OpenAI, Anthropic, Grok)                     │  │
│  │  • Email Service                                      │  │
│  │  • File Storage                                       │  │
│  │  • Image Generation                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ External APIs
                         │
┌────────────────────────┴────────────────────────────────────┐
│               External Services                              │
│  • Financial Data APIs (Alpha Vantage, Refinitiv)          │
│  • News APIs (for sentiment analysis)                       │
│  • Market Data Providers                                    │
│  • Account Aggregation (Plaid, Yodlee)                     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Deal Sourcing Flow

```
User Request → sourceDealOpportunities Function
                ↓
        AI Analysis (LLM + Web Search)
                ↓
        Generate Deal Records
                ↓
        Initial Viability Scoring
                ↓
        Store in SourcedDealOpportunity
                ↓
        Display to User in Pipeline
```

#### Portfolio Rebalancing Flow

```
User Clicks "Generate Recommendations"
                ↓
        Fetch User Investments
                ↓
        Fetch User Preferences
                ↓
        Fetch Market Data
                ↓
        AI Analysis (Current Allocation + Goals)
                ↓
        Generate Rebalancing Actions
                ↓
        Store in PortfolioAdjustmentSuggestion
                ↓
        Display Recommendations to User
```

### Database Schema

#### Core Entities

**Investment**
- Tracks actual user investments
- Performance history
- ROI calculations
- External account linking

**SourcedDealOpportunity**
- AI-generated or sourced deals
- Risk and ROI predictions
- Sentiment analysis data
- Due diligence results

**UserPreferences**
- Risk tolerance
- Investment goals
- Industry preferences
- Target returns

**GamificationEvent**
- Point-earning activities
- Achievement tracking
- User engagement metrics

**Badge & UserAchievement**
- Available badges
- User badge progress
- Unlock criteria

---

## Deployment & Operations

### Environment Configuration

#### Required Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `BASE44_APP_ID` | Base44 application ID | Auto-configured |
| `OPENAI_API_KEY` | OpenAI integration | Set in Base44 dashboard |
| `ANTHROPIC_API_KEY` | Claude integration | Set in Base44 dashboard |
| `GROK_API_KEY` | Grok AI integration | Set in Base44 dashboard |
| `PERPLEXITY_API_KEY` | Perplexity search | Set in Base44 dashboard |

#### Setting Secrets

```bash
# Via Base44 Dashboard
Settings → Environment Variables → Add Secret

# Secrets are automatically available in functions as:
Deno.env.get("SECRET_NAME")
```

### Deployment Process

#### Base44 Platform Deployment

1. **Push changes to repository**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Automatic deployment**
   - Base44 automatically deploys on push
   - Functions are deployed to Deno Deploy
   - Frontend is built and deployed to CDN

3. **Verify deployment**
   - Check Base44 dashboard for deployment status
   - Test functions via dashboard
   - Verify frontend at production URL

### Monitoring & Logging

#### Function Logs

```bash
# View logs in Base44 Dashboard
Code → Functions → Select Function → Logs tab
```

#### Error Tracking

```javascript
// Automatic error logging to ErrorLog entity
try {
  // Operation
} catch (error) {
  await base44.entities.ErrorLog.create({
    message: error.message,
    stack: error.stack,
    context: { /* additional info */ }
  });
}
```

#### Analytics Dashboard

- User engagement metrics
- Deal sourcing performance
- Portfolio ROI tracking
- Feature adoption rates

### Backup & Recovery

#### Automated Backups

```javascript
// Trigger user data backup
await base44.functions.invoke('createUserBackup', {
  backup_type: 'automatic'
});
```

#### Manual Export

```javascript
// Export user data
const exportData = await base44.functions.invoke('exportUserData', {});
```

### Performance Optimization

#### Query Optimization

```javascript
// ✅ Good: Limit and sort
const recent = await base44.entities.Deal.list('-created_date', 10);

// ❌ Bad: Fetch all then filter in JS
const all = await base44.entities.Deal.list();
const recent = all.slice(0, 10);
```

#### Caching Strategy

```javascript
// React Query caching
const { data } = useQuery({
  queryKey: ['deals'],
  queryFn: fetchDeals,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000  // 10 minutes
});
```

---

## Testing & Quality

### Testing Strategy

#### Unit Tests

```javascript
// Example: Testing a utility function
import { calculateROI } from './utils';

test('calculateROI returns correct percentage', () => {
  expect(calculateROI(10000, 12000)).toBe(20);
});
```

#### Integration Tests

```javascript
// Example: Testing entity operations
test('can create and retrieve investment', async () => {
  const investment = await base44.entities.Investment.create({
    investment_name: 'Test',
    initial_investment: 1000
  });
  
  expect(investment.id).toBeDefined();
  
  const retrieved = await base44.entities.Investment.get(investment.id);
  expect(retrieved.investment_name).toBe('Test');
});
```

#### Function Testing

```bash
# Test functions via Base44 dashboard
Code → Functions → Select Function → Test tab

# Or use the test tool:
base44.functions.invoke('functionName', testPayload)
```

### Code Quality Standards

#### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

#### Formatting

```bash
# Prettier configuration
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

#### Code Review Checklist

- [ ] Component is reusable and focused
- [ ] Props are properly typed
- [ ] Error handling is implemented
- [ ] Loading states are handled
- [ ] Accessibility attributes added
- [ ] Responsive design verified
- [ ] Performance optimized
- [ ] Documentation updated

---

## Security & Compliance

### Authentication & Authorization

#### User Authentication

```javascript
// Check authentication
const user = await base44.auth.me();
if (!user) {
  // Redirect to login
  base44.auth.redirectToLogin();
}
```

#### Role-Based Access

```javascript
// Admin-only check
if (user.role !== 'admin') {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}
```

#### Row-Level Security

- User entity has built-in security rules
- Users can only access their own data by default
- Service role needed for cross-user operations

### Data Protection

#### Sensitive Data Handling

```javascript
// ✅ Good: Never log sensitive data
console.log('Processing payment for user:', user.id);

// ❌ Bad: Logging sensitive information
console.log('User data:', user); // May contain email, etc.
```

#### Encryption

- All API communications use HTTPS
- Secrets stored encrypted in Base44
- User passwords hashed (handled by Base44)

### OWASP Top 10 Considerations

1. **Injection**: Use parameterized queries (handled by Base44)
2. **Broken Authentication**: Base44 manages authentication
3. **Sensitive Data Exposure**: Encrypt secrets, use HTTPS
4. **XML External Entities**: Not applicable (JSON only)
5. **Broken Access Control**: Implement role checks
6. **Security Misconfiguration**: Review Base44 security settings
7. **XSS**: React escapes by default, sanitize user input
8. **Insecure Deserialization**: Validate JSON schemas
9. **Using Components with Known Vulnerabilities**: Regular dependency updates
10. **Insufficient Logging**: Log errors to ErrorLog entity

### Compliance

#### GDPR Compliance

- User data export functionality
- Data deletion on request
- Privacy policy required
- Cookie consent (if tracking cookies used)

#### Data Retention

```javascript
// Automated backup retention policy
{
  "automatic_backups": "30 days",
  "user_request_backups": "Until deleted by user",
  "deleted_accounts": "30 days grace period"
}
```

---

## Troubleshooting

### Common Issues

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Authentication error | User not logged in | Call `base44.auth.redirectToLogin()` |
| Function timeout | Long-running operation | Optimize query or increase timeout |
| Entity not found | Wrong entity name | Check entity name capitalization |
| CORS error | API call from wrong origin | Configure Base44 CORS settings |
| Undefined data | Async operation not awaited | Add `await` to promise |
| Rate limit exceeded | Too many API calls | Implement request throttling |
| LLM error | Invalid prompt or schema | Review prompt and JSON schema |

### Debugging Backend Functions

```javascript
// Add console.log for debugging
console.log('Input:', await req.json());
console.log('User:', user);
console.log('Result:', result);

// View logs in Base44 dashboard
// Code → Functions → Select Function → Logs
```

### Debugging Frontend

```javascript
// React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

### Performance Issues

**Symptoms:**
- Slow page loads
- Unresponsive UI
- High memory usage

**Solutions:**
1. Check React Query cache settings
2. Implement pagination for large lists
3. Use `React.memo` for expensive components
4. Lazy load heavy components
5. Optimize images and assets

---

## Changelog

### Version 1.0.0 (January 2026)

**Major Features:**
- ✨ AI-powered deal sourcing with sentiment analysis
- ✨ Comprehensive portfolio management dashboard
- ✨ ROI forecasting and risk assessment
- ✨ External account integration
- ✨ Gamification system with badges and leaderboards
- ✨ Adaptive onboarding flow
- ✨ Community forums and success stories

**Technical Improvements:**
- 🚀 Migrated to React Query for state management
- 🎨 Implemented FlashFusion brand design system
- 🔧 Added real-time entity subscriptions
- 📊 Integrated Recharts for data visualization
- 🌐 PWA support for mobile installation

**Bug Fixes:**
- Fixed onboarding navigation issues
- Resolved portfolio calculation errors
- Corrected gradient text rendering

---

## Appendices

### A. Style Guide

#### Terminology

| Term | Definition |
|------|------------|
| Deal | An investment opportunity |
| Pipeline | User's tracked deals in various stages |
| Portfolio | User's actual investments |
| Match Score | AI confidence that deal matches user preferences |
| Risk Score | 1-10 scale rating risk level |
| ROI | Return on Investment (percentage) |

#### Code Formatting

```javascript
// Function naming: camelCase
function calculateROI(initial, current) { }

// Component naming: PascalCase
function PortfolioCard() { }

// Constants: UPPER_SNAKE_CASE
const MAX_DEALS_PER_PAGE = 50;

// File naming:
// - Pages: PascalCase.js (e.g., DealPipeline.js)
// - Components: PascalCase.jsx (e.g., DealCard.jsx)
// - Functions: camelCase.js (e.g., forecastROI.js)
```

### B. API Response Formats

#### Success Response

```json
{
  "success": true,
  "data": { /* response data */ }
}
```

#### Error Response

```json
{
  "error": "Error message",
  "details": { /* optional error details */ }
}
```

### C. Component Patterns

#### Container/Presenter Pattern

```jsx
// Container (logic)
function PortfolioContainer() {
  const { data } = useQuery(['portfolio'], fetchPortfolio);
  return <PortfolioPresenter data={data} />;
}

// Presenter (UI)
function PortfolioPresenter({ data }) {
  return <div>{/* Render data */}</div>;
}
```

#### Compound Components

```jsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### D. Resources & Links

- **Base44 Documentation**: https://docs.base44.com
- **React Documentation**: https://react.dev
- **TanStack Query**: https://tanstack.com/query
- **Tailwind CSS**: https://tailwindcss.com
- **Deno Documentation**: https://deno.land

### E. Support

- **Technical Issues**: File an issue on GitHub
- **Feature Requests**: Use GitHub Discussions
- **Security Issues**: Email security@flashfusion.com
- **General Questions**: Community forums

---

**Document Version:** 1.0.0  
**Last Updated:** January 22, 2026  
**Maintained by:** FlashFusion Development Team