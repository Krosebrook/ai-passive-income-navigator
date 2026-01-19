# FlashFusion Best Practices

## Architecture Overview

### Component Structure
```
├── entities/           # Data schemas
├── pages/             # Route-level components (flat structure)
├── components/        # Reusable UI components
│   ├── pipeline/     # Deal pipeline specific
│   ├── market/       # Market data components
│   ├── deals/        # Deal management
│   └── ui/           # Shadcn base components
├── functions/         # Backend API endpoints
└── agents/           # AI agent configurations
```

### Key Principles

1. **Component Modularity:** Keep components focused and under 200 lines
2. **Data Separation:** Entities define schemas, components handle presentation
3. **Parallel Operations:** Always use parallel tool calls when possible
4. **Progressive Enhancement:** Start with core features, add polish iteratively

## Data Management

### Entity Design

**Best Practices:**
- Use descriptive property names
- Include metadata fields (created_date, updated_date are automatic)
- Define enums for fixed values
- Add descriptions for documentation

**Example:**
```json
{
  "name": "DealPipeline",
  "type": "object",
  "properties": {
    "deal_name": { "type": "string" },
    "stage": {
      "type": "string",
      "enum": ["research", "analysis", "negotiation", "launch"],
      "description": "Current pipeline stage"
    },
    "estimated_value": { "type": "number" }
  },
  "required": ["deal_name", "stage"]
}
```

### Query Patterns

**Efficient Queries:**
```javascript
// Good: Specific filter with sort
const activeDeals = await base44.entities.DealPipeline.filter(
  { stage: 'negotiation' },
  '-created_date',
  20
);

// Better: Parallel queries
const [deals, tasks, alerts] = await Promise.all([
  base44.entities.DealPipeline.list(),
  base44.entities.DealTask.list(),
  base44.entities.MarketAlert.list()
]);
```

**Use React Query:**
```javascript
const { data, isLoading } = useQuery({
  queryKey: ['deals', filters],
  queryFn: () => base44.entities.DealPipeline.filter(filters),
  staleTime: 60000 // Cache for 1 minute
});
```

## AI Integration

### When to Use AI

**Good Use Cases:**
- Complex analysis requiring reasoning
- Natural language processing
- Pattern recognition in large datasets
- Personalized recommendations
- Market sentiment analysis

**Avoid AI For:**
- Simple calculations
- Fixed rule-based logic
- Real-time operations (> 5 seconds)
- Deterministic outputs

### AI Function Structure

```javascript
// Pattern: Use structured JSON output
const analysis = await base44.integrations.Core.InvokeLLM({
  prompt: detailedPrompt,
  response_json_schema: {
    type: "object",
    properties: {
      score: { type: "number" },
      reasoning: { type: "string" },
      recommendations: {
        type: "array",
        items: { type: "string" }
      }
    }
  }
});
```

### Context Management

- Keep prompts focused and specific
- Provide relevant data only (avoid info dumps)
- Use examples for complex outputs
- Set clear constraints and formats

## Market Data Integration

### Polling Strategy

```javascript
// Refresh every 5 minutes for active view
useQuery({
  queryKey: ['market-data'],
  queryFn: fetchMarketData,
  refetchInterval: 300000,
  staleTime: 240000 // Consider stale after 4 minutes
});
```

### Alert Configuration

**Effective Alerts:**
- Set realistic thresholds (avoid noise)
- Use multiple channels for critical alerts
- Test with historical data first
- Review and adjust monthly

## Performance Optimization

### Code Splitting

```javascript
// Lazy load heavy components
const AnalyticsDashboard = React.lazy(() => 
  import('@/components/pipeline/AnalyticsDashboard')
);

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <AnalyticsDashboard />
</Suspense>
```

### Memoization

```javascript
// Expensive calculations
const filteredDeals = React.useMemo(() => 
  deals.filter(d => d.stage === selectedStage),
  [deals, selectedStage]
);

// Callback stability
const handleDealClick = React.useCallback((dealId) => {
  // handle click
}, [dependencies]);
```

## State Management

### Local vs. Server State

**Local State (useState):**
- UI state (modals, tabs, filters)
- Form inputs
- Temporary data

**Server State (React Query):**
- Entity data
- User preferences
- Analytics results

**Example:**
```javascript
// Local UI state
const [isModalOpen, setIsModalOpen] = useState(false);

// Server state
const { data: deals } = useQuery({
  queryKey: ['deals'],
  queryFn: () => base44.entities.DealPipeline.list()
});
```

## Error Handling

### User-Facing Errors

```javascript
// Use toast notifications
const mutation = useMutation({
  mutationFn: createDeal,
  onSuccess: () => {
    toast.success('Deal created successfully');
  },
  onError: (error) => {
    toast.error(error.message || 'Failed to create deal');
  }
});
```

### Backend Error Handling

```javascript
// Deno function pattern
try {
  // ... operation
  return Response.json({ success: true, data });
} catch (error) {
  console.error('Operation failed:', error);
  return Response.json({ 
    error: error.message 
  }, { status: 500 });
}
```

## Security Best Practices

### Authentication

```javascript
// Always verify user in backend functions
const user = await base44.auth.me();
if (!user) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

// Admin-only operations
if (user.role !== 'admin') {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Data Access

- Use service role sparingly
- Filter data by user when appropriate
- Validate input parameters
- Sanitize user-provided content

## Testing Strategy

### Component Testing

Focus on:
- User interactions
- Data rendering
- Error states
- Loading states

### Backend Testing

```javascript
// Use test_backend_function tool
await test_backend_function('generateDealInsights', {
  dealId: 'test-deal-123'
});
```

## Deployment Checklist

Before Production:
- [ ] Test all backend functions
- [ ] Verify entity schemas
- [ ] Check API rate limits
- [ ] Review error handling
- [ ] Validate user permissions
- [ ] Test with real data in Test DB
- [ ] Monitor performance metrics
- [ ] Set up alerts for failures

## Common Patterns

### Modal Pattern

```javascript
const [modalOpen, setModalOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

const handleItemClick = (item) => {
  setSelectedItem(item);
  setModalOpen(true);
};

return (
  <>
    <ItemList onItemClick={handleItemClick} />
    {selectedItem && (
      <ItemModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />
    )}
  </>
);
```

### CRUD Operations Pattern

```javascript
// Create
const createMutation = useMutation({
  mutationFn: (data) => base44.entities.Entity.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['entities'] });
    toast.success('Created');
  }
});

// Update
const updateMutation = useMutation({
  mutationFn: ({ id, data }) => base44.entities.Entity.update(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['entities'] });
    toast.success('Updated');
  }
});

// Delete
const deleteMutation = useMutation({
  mutationFn: (id) => base44.entities.Entity.delete(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['entities'] });
    toast.success('Deleted');
  }
});
```

## Troubleshooting

### Common Issues

**Issue:** Components not updating after mutation
**Solution:** Ensure query invalidation in onSuccess

**Issue:** Backend function timing out
**Solution:** Check for infinite loops, optimize API calls

**Issue:** Stale data displayed
**Solution:** Adjust staleTime and refetchInterval

**Issue:** High API usage
**Solution:** Implement caching, debounce inputs, batch operations

---

**Maintained by:** FlashFusion Platform Team  
**Last Updated:** January 2026