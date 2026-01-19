# Proactive Guidance System - Developer Guide

## Architecture Overview

The Proactive Guidance System provides context-aware help to users based on their behavior, preferences, and activity patterns.

### Core Components

```
GuidanceProvider (Context Provider)
├── ProactiveGuidanceSystem.jsx (Main orchestrator)
├── ContextualTooltip.jsx (Inline help tooltips)
└── BehaviorTriggers.jsx (Monitors and triggers tips)
```

---

## Component Breakdown

### 1. GuidanceProvider

**Location**: `components/guidance/ProactiveGuidanceSystem.jsx`

**Purpose**: Global context provider that manages guidance state and tip display logic.

**Key Methods**:
```jsx
showTip(tip)          // Display a guidance tip
dismissTip(tipId)     // Permanently dismiss a tip
interactWithTip(tipId, action)  // User clicked action button
trackPageVisit(pageName)  // Track page navigation
```

**State Management**:
- Active tip (currently displayed)
- Page visit counts
- Dismissed tips (from database)

**Usage**:
```jsx
// Wrap root component
<GuidanceProvider>
  <App />
</GuidanceProvider>

// Access in child components
const { showTip, dismissTip } = useGuidance();
```

---

### 2. ContextualTooltip

**Location**: `components/guidance/ContextualTooltip.jsx`

**Purpose**: Reusable tooltip component for inline help on complex features.

**Props**:
```typescript
{
  children?: ReactNode,  // Trigger element (defaults to help icon)
  title?: string,        // Tooltip heading
  description?: string,  // Main explanation
  whyItMatters?: string, // Value proposition
  icon?: 'help' | 'info', // Icon type
  side?: 'top' | 'bottom' | 'left' | 'right' // Position
}
```

**Example Usage**:
```jsx
<ContextualTooltip
  title="Asset Allocation"
  description="Distribute your portfolio across different asset types."
  whyItMatters="Proper allocation reduces risk through diversification."
>
  <HelpCircle className="w-4 h-4" />
</ContextualTooltip>
```

**Styling**:
- Dark background (`#0f0618`)
- Purple accent (`#8b85f7`) for "Why this matters"
- Max width: 320px
- Delay: 200ms

---

### 3. BehaviorTriggers

**Location**: `components/guidance/BehaviorTriggers.jsx`

**Purpose**: Monitors user behavior and triggers contextual tips.

**How It Works**:
1. Tracks page visits on route change
2. Queries user data (preferences, portfolio, deals)
3. Evaluates trigger conditions for each tip
4. Shows first matching tip (one at a time)

**Trigger Anatomy**:
```javascript
{
  id: 'unique_tip_id',
  title: 'Tip Title',
  message: 'Helpful message explaining what to do',
  action: {
    label: 'Action Button Text',
    handler: () => { /* navigation or function */ }
  },
  triggerCondition: (context) => {
    // Return true when tip should show
    return context.someMetric >= threshold;
  }
}
```

**Available Context**:
```javascript
{
  pageVisits: { [pageName]: count },
  hasAdvancedPreferences: boolean,
  hasPortfolioGoals: boolean,
  portfolioCount: number,
  aiDealsGenerated: number,
  enabledIntegrations: number,
  dealsInPipeline: number,
  hasCompletedOnboarding: boolean,
  daysActive: number
}
```

---

## Adding New Guidance Tips

### Step 1: Define the Tip
Add to `GUIDANCE_TIPS` object in `BehaviorTriggers.jsx`:

```javascript
'my_new_tip': {
  id: 'my_new_tip',
  title: 'Tip Title',
  message: 'Helpful guidance message',
  action: {
    label: 'Take Action',
    handler: () => window.location.href = '/target-page'
  },
  triggerCondition: (context) => {
    // Custom logic
    return context.portfolioCount > 5 && context.pageVisits['Analytics'] === 0;
  }
}
```

### Step 2: Test Trigger Logic
Tips are evaluated on:
- Page navigation
- Data changes (preferences, portfolio, deals)
- Every 2 seconds after initial render

**Testing Checklist**:
- [ ] Tip shows when condition is met
- [ ] Tip doesn't show when dismissed
- [ ] Tip stops after 3 views
- [ ] Action button works correctly

### Step 3: Deploy
No additional configuration needed. The system automatically:
- Tracks tip views in `GuidanceTip` entity
- Respects dismissals
- Limits frequency

---

## Database Schema

### GuidanceTip Entity
```json
{
  "tip_id": "string (unique identifier)",
  "dismissed_at": "datetime (when dismissed)",
  "shown_count": "number (times displayed)",
  "interacted": "boolean (clicked action)",
  "created_by": "string (user email)",
  "created_date": "datetime",
  "updated_date": "datetime"
}
```

**Queries**:
- Get all dismissed tips: `filter({ dismissed_at: { $ne: null } })`
- Get tip by ID: `filter({ tip_id: 'tip_id' })`
- Shown count: Access `shown_count` field

---

## Best Practices

### Tooltip Guidelines
1. **Be Concise**: Max 2-3 sentences for description
2. **Show Value**: Always include "Why this matters"
3. **Avoid Jargon**: Write for non-technical users
4. **Strategic Placement**: Only on complex/non-obvious features

### Trigger Condition Guidelines
1. **Clear Threshold**: Define specific metrics (e.g., `>= 3` not `> 2`)
2. **Avoid Spam**: Don't trigger on every page load
3. **Meaningful Context**: Trigger when user would actually benefit
4. **One at a Time**: System shows only one tip simultaneously

### Message Guidelines
1. **Empathetic Tone**: "Still exploring?" not "You haven't done X"
2. **Actionable**: Always provide next step
3. **Brief**: 1-2 sentences max
4. **Benefit-Focused**: Explain what they gain, not what they lack

---

## Performance Considerations

### Query Optimization
- Uses React Query for caching
- Queries run only on mount and data changes
- Tip evaluation is debounced (2s delay)

### Avoiding Re-renders
```jsx
// Good: Memoized trigger evaluation
useMemo(() => evaluateTriggers(context), [context]);

// Bad: Evaluating on every render
evaluateTriggers(context);
```

### Lazy Loading
Tips are rendered only when active:
```jsx
<AnimatePresence>
  {activeTip && <TipCard />}
</AnimatePresence>
```

---

## Accessibility

### Keyboard Navigation
- Tooltips: Focusable with Tab
- Dismiss button: Enter/Space to activate
- Action button: Standard button behavior

### Screen Readers
- Tooltips: `role="tooltip"` with `aria-describedby`
- Tips: Announced when displayed
- Dismiss: Clear "Dismiss" label

---

## Troubleshooting

### Tip Not Showing
1. Check trigger condition logic
2. Verify user hasn't dismissed it
3. Ensure `shown_count < 3`
4. Check console for errors

### Tip Showing Too Often
1. Add stricter trigger conditions
2. Reduce trigger frequency
3. Check dismissal logic

### Action Not Working
1. Verify handler function syntax
2. Check navigation path
3. Test in isolation

---

## Migration Notes

### From Old Onboarding System
Old nudge/tutorial systems should be gradually replaced:
1. Identify overlapping tips
2. Migrate to new GuidanceTip format
3. Update trigger conditions
4. Test thoroughly
5. Remove old system

### Adding to Existing Features
```jsx
// Before (no guidance)
<Label>Complex Feature</Label>

// After (with guidance)
<div className="flex items-center gap-2">
  <Label>Complex Feature</Label>
  <ContextualTooltip
    title="Feature Name"
    description="What it does"
    whyItMatters="Why use it"
  />
</div>
```

---

## Example: Complete Implementation

```jsx
// 1. Add tooltip to form field
<div className="flex items-center gap-2">
  <Label>Risk Tolerance</Label>
  <ContextualTooltip
    title="Risk Tolerance"
    description="How comfortable are you with market volatility?"
    whyItMatters="Guides AI to show deals matching your comfort level."
  />
</div>

// 2. Add behavior trigger
'risk_not_set': {
  id: 'risk_not_set',
  title: 'Set your risk tolerance',
  message: 'Help AI find better matches by setting your risk preference.',
  action: {
    label: 'Set Now',
    handler: () => window.location.href = '/ProfileSettings'
  },
  triggerCondition: (context) => 
    context.daysActive >= 2 && !context.hasAdvancedPreferences
}

// 3. Track in entity (automatic)
// System creates GuidanceTip record on first view
```

---

## Future Enhancements

### Planned Features
- [ ] A/B testing for tip effectiveness
- [ ] User feedback on tip helpfulness
- [ ] ML-based trigger optimization
- [ ] Localization support
- [ ] Video/GIF tutorials in tooltips

### API Endpoints
Consider adding:
- `GET /api/guidance/tips` - Get all available tips
- `POST /api/guidance/feedback` - User feedback
- `GET /api/guidance/analytics` - Tip performance metrics