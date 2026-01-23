# FlashFusion API Documentation
## Complete Backend Function Reference

---

## Table of Contents
1. [Authentication](#authentication)
2. [Deal Management](#deal-management)
3. [Portfolio Management](#portfolio-management)
4. [AI Services](#ai-services)
5. [Community Features](#community-features)
6. [Analytics & Reporting](#analytics-reporting)
7. [Automation & Webhooks](#automation-webhooks)

---

## Authentication

All API requests require authentication via the Base44 SDK. The user's JWT token is automatically handled by the SDK.

### Get Current User
```javascript
const user = await base44.auth.me();
// Returns: { id, email, full_name, role }
```

### Update User Profile
```javascript
await base44.auth.updateMe({ preferences: {...} });
```

### Logout
```javascript
base44.auth.logout('/login');
```

---

## Deal Management

### 1. Source Deal Opportunities

**Function**: `sourceDealOpportunities`

**Description**: AI-powered deal discovery based on user preferences

**Request**:
```javascript
const { data } = await base44.functions.invoke('sourceDealOpportunities', {
  industries: ['Technology', 'Healthcare'],
  min_roi: 15,
  max_investment: 100000,
  risk_tolerance: 'moderate'
});
```

**Response**:
```json
{
  "success": true,
  "deals": [
    {
      "id": "deal_123",
      "title": "SaaS Business",
      "industry": "Technology",
      "estimated_roi": 25,
      "required_investment": 50000,
      "match_score": 87
    }
  ],
  "total_found": 15
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized
- `500`: Server error

---

### 2. Generate Due Diligence Report

**Function**: `generateDueDiligenceReport`

**Description**: Comprehensive AI-driven due diligence analysis

**Request**:
```javascript
const { data } = await base44.functions.invoke('generateDueDiligenceReport', {
  deal_id: 'deal_123'
});
```

**Response**:
```json
{
  "success": true,
  "report": {
    "deal_id": "deal_123",
    "public_records": {
      "business_registration": {
        "status": "Active",
        "verification_level": "verified"
      },
      "legal_proceedings": [],
      "red_flags": []
    },
    "compliance_analysis": {
      "regulatory_framework": [...],
      "compliance_gaps": [...]
    },
    "due_diligence_checklist": {
      "categories": [...]
    },
    "executive_summary": {
      "overall_risk_rating": 4,
      "investment_recommendation": "proceed_with_caution",
      "critical_findings": [...],
      "key_strengths": [...],
      "major_concerns": [...]
    }
  }
}
```

---

### 3. Analyze Deal

**Function**: `analyzeDeal`

**Description**: Quick AI analysis of deal viability

**Request**:
```javascript
const { data } = await base44.functions.invoke('analyzeDeal', {
  deal_id: 'deal_123',
  analysis_depth: 'comprehensive' // or 'quick'
});
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "viability_score": 8.5,
    "roi_projection": {
      "conservative": 15,
      "expected": 22,
      "optimistic": 30
    },
    "key_insights": [...],
    "action_items": [...]
  }
}
```

---

## Portfolio Management

### 1. Detect Portfolio Risks

**Function**: `detectPortfolioRisks`

**Description**: Proactive risk identification and analysis

**Request**:
```javascript
const { data } = await base44.functions.invoke('detectPortfolioRisks', {});
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "overall_risk_level": "moderate",
    "risk_score": 45,
    "portfolio_health_score": 78,
    "identified_risks": [
      {
        "risk_type": "concentration",
        "severity": "medium",
        "description": "40% portfolio in tech sector",
        "recommendation": "Diversify into other sectors",
        "action_items": [
          "Consider real estate investments",
          "Explore healthcare opportunities"
        ]
      }
    ]
  },
  "portfolio_metrics": {
    "total_value": 250000,
    "investment_count": 8,
    "industry_concentration": {...},
    "asset_type_concentration": {...}
  }
}
```

---

### 2. Generate What-If Scenario

**Function**: `generateWhatIfScenario`

**Description**: Model potential investment decisions

**Request**:
```javascript
const { data } = await base44.functions.invoke('generateWhatIfScenario', {
  scenario_type: 'new_investment', // market_crash, exit_investment, reallocation
  parameters: {
    amount: 50000,
    industry: 'Real Estate',
    expected_roi: 18
  }
});
```

**Response**:
```json
{
  "success": true,
  "scenario": {
    "scenario_name": "Adding $50K Real Estate Investment",
    "current_state": {
      "total_value": 250000,
      "risk_level": "moderate",
      "diversification_score": 65
    },
    "projected_state": {
      "total_value": 300000,
      "value_change": 50000,
      "value_change_percentage": 20,
      "risk_level": "moderate",
      "diversification_score": 75
    },
    "impact_analysis": [...],
    "recommendation": {
      "action": "proceed",
      "confidence": 0.85,
      "reasoning": "Improves diversification and maintains acceptable risk",
      "considerations": [...]
    },
    "alternative_scenarios": [...],
    "timeline_impact": {
      "short_term": "Positive",
      "medium_term": "Positive",
      "long_term": "Very Positive"
    }
  }
}
```

---

### 3. Track Financial Goals

**Function**: `trackFinancialGoals`

**Description**: Monitor progress toward financial goals

**Request**:
```javascript
const { data } = await base44.functions.invoke('trackFinancialGoals', {});
```

**Response**:
```json
{
  "success": true,
  "goals_analyzed": 3,
  "updates": [
    {
      "goal_id": "goal_123",
      "goal_name": "Retirement Fund",
      "analysis": {
        "status": "on_track",
        "progress_assessment": "Making good progress...",
        "required_monthly_contribution": 2500,
        "recommended_allocation": {
          "conservative": 40,
          "moderate": 35,
          "aggressive": 25
        },
        "risk_assessment": {
          "likelihood_of_success": 0.85,
          "key_risks": [...],
          "mitigation_strategies": [...]
        },
        "recommendations": [...],
        "milestones": [...]
      }
    }
  ]
}
```

---

### 4. Generate Rebalancing Recommendations

**Function**: `generateRebalancingRecommendations`

**Description**: AI-driven portfolio rebalancing suggestions

**Request**:
```javascript
const { data } = await base44.functions.invoke('generateRebalancingRecommendations', {
  target_allocation: {
    'Technology': 30,
    'Real Estate': 25,
    'Healthcare': 20,
    'Finance': 15,
    'Other': 10
  }
});
```

**Response**:
```json
{
  "success": true,
  "recommendations": {
    "overall_assessment": "Portfolio requires minor adjustments",
    "recommendations": [
      {
        "action": "reduce",
        "category": "Technology",
        "percentage": 5,
        "rationale": "Overweight in tech sector",
        "priority": "medium",
        "timeline": "Within 30 days"
      }
    ],
    "target_allocation": {...},
    "risk_analysis": {...},
    "market_context": "Current market favors diversification..."
  }
}
```

---

## AI Services

### 1. Analyze Market Trends

**Function**: `analyzeMarketTrends`

**Description**: Comprehensive market intelligence and insights

**Request**:
```javascript
const { data } = await base44.functions.invoke('analyzeMarketTrends', {
  industries: ['Technology', 'Healthcare', 'Real Estate'],
  timeframe: '6 months'
});
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "market_overview": {
      "overall_sentiment": "bullish",
      "confidence_level": 0.78,
      "summary": "Markets showing strong momentum..."
    },
    "industry_analysis": [
      {
        "industry": "Technology",
        "trend": "growing",
        "opportunity_score": 85,
        "key_drivers": [
          "AI adoption acceleration",
          "Cloud migration continues"
        ],
        "risks": ["Regulatory concerns", "Valuation concerns"],
        "investment_outlook": "Favorable for selective investments"
      }
    ],
    "emerging_opportunities": [...],
    "sectors_to_watch": [...],
    "sectors_to_avoid": [...],
    "actionable_insights": [
      {
        "insight": "AI infrastructure companies showing 30%+ growth",
        "action": "Consider positions in AI-focused businesses",
        "priority": "high",
        "timeframe": "1-3 months"
      }
    ],
    "timing_recommendations": {
      "buy_opportunities": [...],
      "sell_signals": [...],
      "hold_steady": [...]
    }
  },
  "generated_at": "2026-01-23T..."
}
```

---

### 2. Generate Investment Strategy

**Function**: `generateInvestmentStrategy`

**Description**: Personalized investment strategy recommendations

**Request**:
```javascript
const { data } = await base44.functions.invoke('generateInvestmentStrategy', {
  user_preferences: {
    risk_tolerance: 'moderate',
    time_horizon: 'long_term',
    target_return: 15,
    focus_areas: ['passive_income', 'capital_growth']
  }
});
```

**Response**:
```json
{
  "success": true,
  "strategy": {
    "strategic_direction": "Balanced growth with income focus...",
    "asset_allocation": {
      "recommended_categories": [
        {
          "category": "Dividend Stocks",
          "percentage": 30,
          "rationale": "Stable income generation"
        }
      ]
    },
    "short_term_actions": [...],
    "long_term_milestones": [...],
    "risk_management": {...},
    "growth_opportunities": [...],
    "success_metrics": [...]
  }
}
```

---

### 3. Forecast Deal ROI

**Function**: `forecastDealROI`

**Description**: Predictive ROI analysis for deals

**Request**:
```javascript
const { data } = await base44.functions.invoke('forecastDealROI', {
  deal_id: 'deal_123',
  time_horizon_years: 5,
  scenarios: ['conservative', 'expected', 'optimistic']
});
```

**Response**:
```json
{
  "success": true,
  "forecast": {
    "conservative": {
      "roi_percentage": 12,
      "total_return": 60000,
      "confidence": 0.8
    },
    "expected": {
      "roi_percentage": 22,
      "total_return": 110000,
      "confidence": 0.6
    },
    "optimistic": {
      "roi_percentage": 35,
      "total_return": 175000,
      "confidence": 0.3
    },
    "key_assumptions": [...],
    "sensitivity_analysis": {...}
  }
}
```

---

## Community Features

### 1. Create Shared Watchlist

**Entity**: `SharedWatchlist`

**Description**: Create a public or private watchlist

**Request**:
```javascript
const watchlist = await base44.entities.SharedWatchlist.create({
  name: 'Tech Growth Opportunities',
  description: 'High-growth SaaS and AI businesses',
  is_public: true,
  deals: ['deal_123', 'deal_456'],
  tags: ['technology', 'saas', 'ai']
});
```

---

### 2. Join Investment Group

**Entity**: `InvestmentGroup`

**Description**: Join or create investment groups

**Request**:
```javascript
const group = await base44.entities.InvestmentGroup.get('group_123');
const user = await base44.auth.me();

group.members.push({
  email: user.email,
  role: 'member',
  joined_date: new Date().toISOString()
});

await base44.entities.InvestmentGroup.update('group_123', {
  members: group.members
});
```

---

### 3. Rate Expert Content

**Entity**: `ContentRating`

**Description**: Rate and review expert content

**Request**:
```javascript
const rating = await base44.entities.ContentRating.create({
  user_email: user.email,
  content_id: 'content_123',
  content_type: 'expert_content',
  rating: 5,
  review: 'Excellent analysis with actionable insights'
});
```

---

## Analytics & Reporting

### 1. Get Portfolio Analytics

**Function**: `generatePerformanceReport`

**Description**: Detailed portfolio performance analysis

**Request**:
```javascript
const { data } = await base44.functions.invoke('generatePerformanceReport', {
  time_period: 'YTD', // MTD, QTD, YTD, 1Y, All
  include_attribution: true,
  benchmark: 'SP500'
});
```

**Response**:
```json
{
  "success": true,
  "report": {
    "summary": {
      "total_return": 15.5,
      "benchmark_return": 12.3,
      "alpha": 3.2,
      "volatility": 14.2,
      "sharpe_ratio": 1.09
    },
    "attribution": {
      "asset_allocation": 2.1,
      "security_selection": 1.1
    },
    "top_performers": [...],
    "underperformers": [...]
  }
}
```

---

## Automation & Webhooks

### 1. Create Automation

**Description**: Set up recurring tasks or entity-triggered actions

**Request**:
```javascript
await base44.automations.create({
  automation_type: 'scheduled',
  name: 'Daily Risk Scan',
  function_name: 'detectPortfolioRisks',
  schedule_type: 'simple',
  repeat_interval: 1,
  repeat_unit: 'days',
  start_time: '09:00'
});
```

---

### 2. Entity Automation

**Description**: Trigger functions on entity changes

**Request**:
```javascript
await base44.automations.create({
  automation_type: 'entity',
  name: 'New Investment Alert',
  function_name: 'sendInvestmentAlert',
  entity_name: 'Investment',
  event_types: ['create']
});
```

---

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

### Common Error Codes
- `UNAUTHORIZED`: Invalid or missing authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input parameters
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `AI_SERVICE_ERROR`: AI provider issue
- `DATABASE_ERROR`: Data persistence issue

---

## Rate Limits

### Free Tier
- 100 requests/hour
- 1,000 requests/day
- 10 AI analysis/day

### Pro Tier
- 1,000 requests/hour
- 10,000 requests/day
- 100 AI analysis/day

### Enterprise
- Custom limits
- Dedicated infrastructure

---

## SDK Usage Examples

### React Component
```javascript
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';

function PortfolioRiskDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['portfolio-risks'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('detectPortfolioRisks', {});
      return data;
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('analyzeMarketTrends', {
        industries: ['Technology']
      });
    },
    onSuccess: (data) => {
      console.log('Analysis complete:', data);
    }
  });

  return (
    <div>
      {/* UI components */}
    </div>
  );
}
```

---

## Best Practices

### 1. Error Handling
```javascript
try {
  const { data } = await base44.functions.invoke('functionName', params);
  // Handle success
} catch (error) {
  if (error.status === 401) {
    // Redirect to login
  } else if (error.status === 429) {
    // Rate limit - show message
  } else {
    // Generic error handling
    toast.error('Operation failed');
  }
}
```

### 2. Loading States
```javascript
const { data, isLoading, error } = useQuery({
  queryKey: ['key'],
  queryFn: fetchFunction
});

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <DataDisplay data={data} />;
```

### 3. Optimistic Updates
```javascript
const mutation = useMutation({
  mutationFn: updateFunction,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['data'] });
    const previousData = queryClient.getQueryData(['data']);
    queryClient.setQueryData(['data'], newData);
    return { previousData };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['data'], context.previousData);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['data'] });
  }
});
```

---

## Support & Resources

- **Documentation**: https://docs.ideabrowser.com
- **API Status**: https://status.ideabrowser.com
- **Community Forum**: https://community.ideabrowser.com
- **Support Email**: support@ideabrowser.com