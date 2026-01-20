# Testing Guide

## Overview

This guide covers testing strategies, best practices, and how to write and run tests for the AI Passive Income Navigator application.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Testing Stack](#testing-stack)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Organization](#test-organization)
- [Testing Patterns](#testing-patterns)
- [Mocking and Fixtures](#mocking-and-fixtures)
- [Code Coverage](#code-coverage)
- [Best Practices](#best-practices)

## Testing Philosophy

### Testing Pyramid

```
       /\
      /  \     E2E Tests (Few)
     /----\
    /      \   Integration Tests (Some)
   /--------\
  /          \ Unit Tests (Many)
 /____________\
```

**Unit Tests (Many):**
- Test individual functions and components
- Fast and isolated
- 70% of tests

**Integration Tests (Some):**
- Test component interactions
- Test with real hooks and context
- 20% of tests

**E2E Tests (Few):**
- Test complete user flows
- Slowest but most comprehensive
- 10% of tests

### What to Test

✅ **Do Test:**
- User interactions and behavior
- Component rendering with different props
- Error states and edge cases
- Business logic and calculations
- API integration points
- Form validation
- Accessibility features

❌ **Don't Test:**
- Implementation details
- Third-party libraries
- Trivial code (getters/setters)
- Static content
- CSS styles (use visual regression instead)

## Testing Stack

| Tool | Purpose | Version |
|------|---------|---------|
| Vitest | Test runner | 4.0.17 |
| Testing Library | React testing utilities | 16.3.1 |
| jest-dom | DOM matchers | 6.9.1 |
| user-event | User interaction simulation | 14.6.1 |
| jsdom | DOM implementation | 27.4.0 |

## Running Tests

### Basic Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Running Specific Tests

```bash
# Run tests in a specific file
npm test src/components/Portfolio.test.jsx

# Run tests matching a pattern
npm test --grep "Portfolio"

# Run tests with specific name
npm test --testNamePattern "should render correctly"
```

### Watch Mode

In watch mode, Vitest will:
- Re-run tests when files change
- Show test results in terminal
- Allow filtering tests interactively

Press `h` in watch mode to see all options.

## Writing Tests

### Basic Test Structure

```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render the title', () => {
    // Arrange
    const title = 'Test Title';
    
    // Act
    render(<MyComponent title={title} />);
    
    // Assert
    expect(screen.getByText(title)).toBeInTheDocument();
  });
});
```

### Testing Components

**Simple Component:**

```javascript
// MyButton.jsx
const MyButton = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
);

// MyButton.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MyButton from './MyButton';

describe('MyButton', () => {
  it('should render with label', () => {
    render(<MyButton label="Click me" />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<MyButton label="Click me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click me'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Component with State:**

```javascript
// Counter.jsx
const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
};

// Counter.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import Counter from './Counter';

describe('Counter', () => {
  it('should increment count when button is clicked', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
    
    await user.click(screen.getByText('Increment'));
    
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});
```

### Testing Hooks

**Custom Hook:**

```javascript
// useCounter.js
export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  return { count, increment, decrement };
}

// useCounter.test.js
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should initialize with custom value', () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it('should increment count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

### Testing Forms

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    
    render(<LoginForm onSubmit={handleSubmit} />);
    
    // Fill form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    // Assert
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should show validation errors', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);
    
    // Submit without filling form
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    // Assert errors are shown
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
});
```

### Testing API Calls

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import { base44 } from '@/api/base44Client';
import IdeasList from './IdeasList';

// Mock API
vi.mock('@/api/base44Client', () => ({
  base44: {
    ideas: {
      list: vi.fn()
    }
  }
}));

describe('IdeasList', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should display ideas when loaded', async () => {
    // Mock successful response
    base44.ideas.list.mockResolvedValue([
      { id: '1', title: 'Idea 1' },
      { id: '2', title: 'Idea 2' }
    ]);

    render(<IdeasList />, { wrapper });

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Idea 1')).toBeInTheDocument();
      expect(screen.getByText('Idea 2')).toBeInTheDocument();
    });
  });

  it('should display error message on failure', async () => {
    // Mock error response
    base44.ideas.list.mockRejectedValue(new Error('Failed to load'));

    render(<IdeasList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });
});
```

### Testing Async Operations

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

describe('AsyncComponent', () => {
  it('should handle async operations', async () => {
    const user = userEvent.setup();
    const mockFetch = vi.fn().mockResolvedValue({ data: 'Success' });
    
    render(<AsyncComponent onFetch={mockFetch} />);
    
    await user.click(screen.getByRole('button', { name: /fetch/i }));
    
    // Show loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
    
    expect(mockFetch).toHaveBeenCalled();
  });
});
```

## Test Organization

### File Structure

```
src/
├── components/
│   ├── Portfolio/
│   │   ├── PortfolioCard.jsx
│   │   ├── PortfolioCard.test.jsx
│   │   ├── PortfolioList.jsx
│   │   └── PortfolioList.test.jsx
│   └── ui/
│       ├── Button.jsx
│       └── Button.test.jsx
├── hooks/
│   ├── usePortfolio.jsx
│   └── usePortfolio.test.jsx
├── utils/
│   ├── formatCurrency.js
│   └── formatCurrency.test.js
└── test/
    ├── setup.js
    ├── mocks/
    │   ├── handlers.js
    │   └── server.js
    └── utils/
        └── test-utils.jsx
```

### Test Utilities

Create reusable test utilities:

```javascript
// src/test/utils/test-utils.jsx
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const AllTheProviders = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };
```

Usage:
```javascript
import { render, screen } from '@/test/utils/test-utils';
// Now render includes all providers automatically
```

## Testing Patterns

### Arrange-Act-Assert (AAA)

```javascript
it('should calculate total correctly', () => {
  // Arrange
  const items = [
    { price: 10 },
    { price: 20 },
    { price: 30 }
  ];
  
  // Act
  const total = calculateTotal(items);
  
  // Assert
  expect(total).toBe(60);
});
```

### Given-When-Then (BDD Style)

```javascript
describe('Portfolio calculation', () => {
  it('should sum all item revenues', () => {
    // Given a portfolio with multiple items
    const portfolio = [
      { revenue: 100 },
      { revenue: 200 },
      { revenue: 300 }
    ];
    
    // When calculating total revenue
    const total = calculateTotalRevenue(portfolio);
    
    // Then the sum should be correct
    expect(total).toBe(600);
  });
});
```

### Snapshot Testing

```javascript
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PortfolioCard from './PortfolioCard';

describe('PortfolioCard', () => {
  it('should match snapshot', () => {
    const { container } = render(
      <PortfolioCard
        title="E-commerce Store"
        revenue={5000}
        status="active"
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

## Mocking and Fixtures

### Mocking Modules

```javascript
import { vi } from 'vitest';

// Mock entire module
vi.mock('@/api/base44Client', () => ({
  base44: {
    ideas: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn()
    }
  }
}));

// Mock specific function
vi.mock('@/utils/formatCurrency', () => ({
  formatCurrency: vi.fn((amount) => `$${amount}`)
}));
```

### Test Fixtures

```javascript
// src/test/fixtures/ideas.js
export const mockIdeas = [
  {
    id: '1',
    title: 'E-commerce Store',
    category: 'E-commerce',
    difficulty: 'intermediate',
    initialInvestment: 5000
  },
  {
    id: '2',
    title: 'Blog Website',
    category: 'Content',
    difficulty: 'beginner',
    initialInvestment: 500
  }
];

// Use in tests
import { mockIdeas } from '@/test/fixtures/ideas';

it('should render ideas', () => {
  render(<IdeasList ideas={mockIdeas} />);
  // ...
});
```

### Mocking API Responses

```javascript
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/ideas', (req, res, ctx) => {
    return res(ctx.json(mockIdeas));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Code Coverage

### Running Coverage

```bash
npm run test:coverage
```

### Coverage Reports

Coverage reports are generated in `coverage/` directory:
- `coverage/index.html` - HTML report (open in browser)
- `coverage/lcov-report/` - Detailed LCOV report
- `coverage/coverage-final.json` - JSON data

### Coverage Targets

Aim for:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Interpreting Coverage

- **Green**: Well covered
- **Yellow**: Partially covered
- **Red**: Not covered

Focus on covering:
1. Critical business logic
2. Error handling paths
3. Edge cases
4. User interactions

## Best Practices

### 1. Test User Behavior, Not Implementation

```javascript
// ❌ Bad: Testing implementation
expect(component.state.count).toBe(1);

// ✅ Good: Testing user perspective
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

### 2. Use Accessible Queries

Prefer queries in this order:
1. `getByRole` - Best for accessibility
2. `getByLabelText` - For form fields
3. `getByPlaceholderText` - For inputs
4. `getByText` - For non-interactive elements
5. `getByTestId` - Last resort

```javascript
// ✅ Good
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);

// ❌ Avoid
screen.getByTestId('submit-button');
```

### 3. Avoid Testing Implementation Details

```javascript
// ❌ Bad
expect(component.find('.internal-class')).toHaveLength(1);

// ✅ Good
expect(screen.getByRole('list')).toBeInTheDocument();
```

### 4. Keep Tests Independent

```javascript
// ❌ Bad: Tests depend on each other
let sharedState;

it('test 1', () => {
  sharedState = doSomething();
});

it('test 2', () => {
  expect(sharedState).toBe('something'); // Depends on test 1
});

// ✅ Good: Each test is independent
it('test 1', () => {
  const state = doSomething();
  expect(state).toBe('something');
});

it('test 2', () => {
  const state = doSomething();
  expect(state).toBe('something');
});
```

### 5. Use Descriptive Test Names

```javascript
// ❌ Bad
it('works', () => {});

// ✅ Good
it('should display error message when API call fails', () => {});
```

### 6. Test Edge Cases

```javascript
describe('formatCurrency', () => {
  it('should format positive numbers', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
  });

  it('should format negative numbers', () => {
    expect(formatCurrency(-1000)).toBe('-$1,000.00');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should handle very large numbers', () => {
    expect(formatCurrency(1000000000)).toBe('$1,000,000,000.00');
  });

  it('should handle decimal precision', () => {
    expect(formatCurrency(10.567)).toBe('$10.57');
  });
});
```

### 7. Clean Up After Tests

```javascript
import { vi } from 'vitest';

describe('MyComponent', () => {
  afterEach(() => {
    vi.clearAllMocks(); // Clear mock data
    cleanup(); // Clean up rendered components
  });
});
```

### 8. Use waitFor for Async

```javascript
// ✅ Good
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// ❌ Bad
await new Promise(resolve => setTimeout(resolve, 1000));
expect(screen.getByText('Loaded')).toBeInTheDocument();
```

## Related Documentation

- [Development Guide](./DEVELOPMENT.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Architecture Documentation](../ARCHITECTURE.md)

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-19  
**Maintained by**: Development Team
