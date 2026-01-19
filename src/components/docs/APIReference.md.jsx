# API Reference - FlashFusion

## Backend Functions

### generateAIDeals

**Purpose**: Generate personalized investment opportunities using AI based on user preferences.

**Endpoint**: `POST /functions/generateAIDeals`

**Authentication**: Required (user token)

**Request Body**:
```json
{
  "preferences": {
    "passive_income_goal": "string",
    "risk_tolerance": "string",
    "investment_size_min": "number",
    "investment_size_max": "number",
    "target_industries": ["string"],
    "time_horizon": "string"
  },
  "count": "number (default: 5, max: 10)"
}
```

**Response**:
```json
{
  "success": true,
  "count": 5,
  "deals": [
    {
      "title": "string",
      "industry": "string",
      "summary": "string",
      "estimated_value": "number",
      "estimated_roi": "number",
      "time_to_roi": "string",
      "risk_score": "number (1-10)",
      "match_score": "number (0-100)",
      "key_opportunities": ["string"],
      "key_risks": ["string"],
      "is_generated": true,
      "status": "pending",
      "source": "ai_generated"
    }
  ]
}
```

**Error Response**:
```json
{
  "error": "Error message",
  "details": "Detailed error description"
}
```

**Usage Example**:
```javascript
const result = await base44.functions.invoke('generateAIDeals', {
  preferences: userPreferences,
  count: 5
});
```

---

## Entities

### GuidanceTip

**Purpose**: Track user interactions with guidance tips for personalized help.

**Schema**:
```json
{
  "tip_id": "string (required)",
  "dismissed_at": "datetime (nullable)",
  "shown_count": "number (default: 0)",
  "interacted": "boolean (default: false)"
}
```

**Built-in Fields**:
- `id`: UUID
- `created_by`: User email
- `created_date`: Timestamp
- `updated_date`: Timestamp

**Common Queries**:
```javascript
// Get all dismissed tips
const dismissed = await base44.entities.GuidanceTip.filter({
  dismissed_at: { $ne: null }
});

// Get specific tip
const tip = await base44.entities.GuidanceTip.filter({
  tip_id: 'deal_criteria_revisit'
});

// Update shown count
await base44.entities.GuidanceTip.update(tipId, {
  shown_count: currentCount + 1
});
```

---

### SourcedDealOpportunity

**Purpose**: Store AI-generated and manually sourced investment opportunities.

**Schema**:
```json
{
  "title": "string (required)",
  "industry": "string (required)",
  "summary": "string (required)",
  "description": "string",
  "estimated_value": "number",
  "estimated_roi": "number",
  "time_to_roi": "string",
  "risk_score": "number (1-10)",
  "match_score": "number (0-100)",
  "key_opportunities": ["string"],
  "key_risks": ["string"],
  "source": "enum: ai_generated | manual | api_sourced",
  "status": "enum: pending | accepted | rejected | dismissed | in_progress",
  "is_generated": "boolean (default: true)",
  "source_url": "string",
  "contact_info": "object"
}
```

**Common Operations**:
```javascript
// Get all AI-generated deals
const aiDeals = await base44.entities.SourcedDealOpportunity.filter({
  is_generated: true,
  status: { $ne: 'dismissed' }
});

// Update deal status
await base44.entities.SourcedDealOpportunity.update(dealId, {
  status: 'accepted'
});

// Dismiss deal
await base44.entities.SourcedDealOpportunity.update(dealId, {
  status: 'dismissed'
});
```

---

## React Hooks

### useGuidance

**Purpose**: Access guidance system functionality in any component.

**Import**:
```javascript
import { useGuidance } from '@/components/guidance/ProactiveGuidanceSystem';
```

**Returns**:
```javascript
{
  showTip: (tip) => void,
  dismissTip: (tipId) => void,
  interactWithTip: (tipId, action) => void,
  trackPageVisit: (pageName) => void,
  pageVisits: { [pageName]: number },
  dismissedTips: Array<GuidanceTip>
}
```

**Example**:
```javascript
const { showTip, dismissTip } = useGuidance();

// Show a tip
showTip({
  id: 'custom_tip',
  title: 'Helpful Title',
  message: 'Helpful message',
  action: {
    label: 'Take Action',
    handler: () => navigate('/somewhere')
  }
});

// Dismiss a tip
dismissTip('custom_tip');
```

---

### useGuidanceTip

**Purpose**: Simplified hook to show tips based on conditions.

**Import**:
```javascript
import { useGuidanceTip } from '@/components/guidance/hooks/useGuidanceTip';
```

**Signature**:
```javascript
useGuidanceTip(tip, shouldShow, dependencies)
```

**Parameters**:
- `tip`: Tip configuration object
- `shouldShow`: Boolean condition to trigger tip
- `dependencies`: Array of values to watch for changes

**Example**:
```javascript
useGuidanceTip(
  {
    id: 'incomplete_profile',
    title: 'Complete Your Profile',
    message: 'Add more details for better recommendations',
    action: {
      label: 'Complete Now',
      handler: () => navigate('/profile')
    }
  },
  !userProfile.isComplete,
  [userProfile]
);
```

---

### usePageTracking

**Purpose**: Automatically track page visits for guidance triggers.

**Import**:
```javascript
import { usePageTracking } from '@/components/guidance/hooks/useGuidanceTip';
```

**Usage**:
```javascript
function MyPage() {
  usePageTracking('MyPage');
  
  return (
    // page content
  );
}
```

---

## Component Props

### ContextualTooltip

**Props**:
```typescript
{
  children?: ReactNode;       // Trigger element (optional)
  title?: string;            // Tooltip heading
  description?: string;      // Main explanation
  whyItMatters?: string;     // Value proposition
  icon?: 'help' | 'info';   // Icon type (default: 'help')
  side?: 'top' | 'bottom' | 'left' | 'right'; // Position (default: 'top')
}
```

**Example**:
```jsx
<ContextualTooltip
  title="Asset Allocation"
  description="Distribute investments across asset types"
  whyItMatters="Reduces risk through diversification"
  side="right"
>
  <HelpCircle className="w-4 h-4" />
</ContextualTooltip>
```

---

### EnhancedOnboardingFlow

**Props**:
```typescript
{
  open: boolean;              // Dialog visibility
  onClose: () => void;       // Close handler
}
```

**Example**:
```jsx
<EnhancedOnboardingFlow
  open={showOnboarding}
  onClose={() => setShowOnboarding(false)}
/>
```

---

### AIGeneratedDeals

**Props**: None (uses React Query internally)

**Example**:
```jsx
<AIGeneratedDeals />
```

**Features**:
- Fetches AI-generated deals
- Generate button triggers LLM
- Save to pipeline
- Dismiss unwanted deals

---

### PortfolioPerformanceCharts

**Props**:
```typescript
{
  portfolioIdeas: Array<PortfolioIdea>; // User's portfolio items
}
```

**Example**:
```jsx
<PortfolioPerformanceCharts portfolioIdeas={portfolioIdeas} />
```

**Charts Included**:
- Portfolio growth (line chart)
- Asset allocation (pie chart)
- Risk distribution (bar chart)
- Scenario simulator (interactive)

---

## Error Handling

### Standard Error Format
```json
{
  "error": "Human-readable error message",
  "details": "Technical details for debugging",
  "code": "ERROR_CODE" (optional)
}
```

### Common Error Codes
- `UNAUTHORIZED`: User not authenticated
- `INVALID_INPUT`: Request validation failed
- `NOT_FOUND`: Resource doesn't exist
- `RATE_LIMIT`: Too many requests
- `SERVER_ERROR`: Internal server error

### Error Handling Example
```javascript
try {
  const result = await base44.functions.invoke('generateAIDeals', params);
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
  } else {
    // Show error toast
    toast.error(error.message || 'Something went wrong');
  }
}
```

---

## Rate Limits

### AI Deal Generation
- **Limit**: 10 requests per hour per user
- **Reason**: Prevent API abuse and manage costs
- **Response**: 429 Too Many Requests

### Guidance Tips
- **Limit**: None (stored locally)
- **Best Practice**: Max 3 views per tip

---

## Webhooks (Future)

### Deal Status Change
```json
POST /webhooks/deal-status-changed
{
  "deal_id": "string",
  "old_status": "string",
  "new_status": "string",
  "changed_by": "string",
  "timestamp": "datetime"
}
```

### Portfolio Rebalance Needed
```json
POST /webhooks/rebalance-alert
{
  "user_id": "string",
  "current_allocation": {},
  "target_allocation": {},
  "drift_percentage": "number",
  "timestamp": "datetime"
}
``