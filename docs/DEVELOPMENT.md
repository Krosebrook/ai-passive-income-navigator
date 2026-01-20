# Development Guide

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style and Standards](#code-style-and-standards)
- [Building and Testing](#building-and-testing)
- [Debugging](#debugging)
- [Common Development Tasks](#common-development-tasks)
- [Tips and Best Practices](#tips-and-best-practices)

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: Latest version
- **Code Editor**: VS Code recommended

### Verify Installation

```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
git --version   # Any recent version
```

## Development Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Krosebrook/ai-passive-income-navigator.git
cd ai-passive-income-navigator
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies listed in `package.json`.

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Base44 credentials:

```bash
VITE_BASE44_APP_ID=your_app_id_here
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Verify Setup

- Open browser to `http://localhost:5173`
- Check browser console for errors
- Verify hot module replacement works (edit a file and see changes)

## Project Structure

```
ai-passive-income-navigator/
├── .github/                 # GitHub configuration
│   └── workflows/          # CI/CD workflows
├── docs/                   # Documentation
├── functions/              # Base44 cloud functions
├── public/                 # Static assets
├── src/                    # Source code
│   ├── api/               # API client configuration
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   └── [features]/   # Feature-specific components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and helpers
│   ├── pages/            # Page components (routes)
│   ├── test/             # Test utilities
│   └── utils/            # Utility functions
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── components.json       # Shadcn/ui configuration
├── eslint.config.js      # ESLint configuration
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── vite.config.js        # Vite build configuration
└── vitest.config.js      # Vitest test configuration
```

### Key Directories

**`src/components/`**
- Organized by feature (e.g., `ideas/`, `portfolio/`, `dashboard/`)
- `ui/` contains reusable, generic components
- Each feature folder contains components specific to that feature

**`src/pages/`**
- Route-level components
- One file per route
- Compose feature components

**`src/hooks/`**
- Custom React hooks
- Reusable logic extracted from components

**`src/lib/`**
- Utilities, helpers, and configurations
- Non-React specific code

**`functions/`**
- Base44 cloud functions
- TypeScript files for serverless functions

## Development Workflow

### Daily Workflow

1. **Pull latest changes:**
```bash
git checkout main
git pull origin main
```

2. **Create a feature branch:**
```bash
git checkout -b feature/your-feature-name
```

3. **Make changes:**
- Edit files
- Save and see hot reload
- Check browser console for errors

4. **Test your changes:**
```bash
npm run lint          # Check for code issues
npm run typecheck     # Type checking
npm test              # Run tests
```

5. **Commit your changes:**
```bash
git add .
git commit -m "feat: add new feature"
```

6. **Push and create PR:**
```bash
git push origin feature/your-feature-name
# Create PR on GitHub
```

### Git Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(scope): add new feature
fix(scope): fix bug in component
docs: update documentation
style: format code
refactor: restructure component
test: add tests for feature
chore: update dependencies
```

## Code Style and Standards

### ESLint Configuration

The project uses ESLint for code linting:

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Code Formatting

- Use Prettier defaults
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in multi-line

### Naming Conventions

**Files:**
- Components: `PascalCase.jsx` (e.g., `PortfolioCard.jsx`)
- Hooks: `camelCase.jsx` (e.g., `usePortfolio.jsx`)
- Utils: `camelCase.js` (e.g., `formatCurrency.js`)
- Constants: `UPPER_SNAKE_CASE.js` (e.g., `API_ENDPOINTS.js`)

**Variables:**
- Components: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Private: prefix with `_` (e.g., `_privateFunction`)

**CSS Classes:**
- Use Tailwind utility classes
- Custom classes: `kebab-case`

### Component Structure

```jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// 1. Component definition
const MyComponent = ({ title, onAction }) => {
  // 2. Hooks
  const [state, setState] = useState(null);

  // 3. Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // 4. Event handlers
  const handleClick = () => {
    onAction?.();
  };

  // 5. Render helpers (if needed)
  const renderContent = () => {
    return <div>Content</div>;
  };

  // 6. Return JSX
  return (
    <div className="container">
      <h1>{title}</h1>
      {renderContent()}
    </div>
  );
};

// 7. PropTypes
MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onAction: PropTypes.func,
};

// 8. Default export
export default MyComponent;
```

## Building and Testing

### Development Build

```bash
npm run dev
```

- Hot module replacement (HMR)
- Source maps enabled
- Not optimized (faster builds)

### Production Build

```bash
npm run build
```

- Minified and optimized
- Tree-shaking applied
- Source maps for debugging

### Preview Production Build

```bash
npm run preview
```

Access at `http://localhost:4173`

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Type Checking

```bash
npm run typecheck
```

## Debugging

### Browser DevTools

**React DevTools:**
1. Install React DevTools extension
2. Open browser DevTools
3. Navigate to "Components" tab
4. Inspect component props and state

**Network Tab:**
- Monitor API requests
- Check request/response data
- Verify authentication headers

**Console:**
- Check for JavaScript errors
- View console.log statements
- Monitor warnings

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

Set breakpoints in VS Code and press F5.

### React Query Devtools

React Query Devtools are included in development:

```jsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

Access via icon in bottom-right corner.

### Common Debugging Techniques

**Component not rendering:**
```jsx
console.log('Component rendered', { props, state });
```

**API call issues:**
```javascript
const { data, error, isLoading } = useQuery({
  queryKey: ['ideas'],
  queryFn: async () => {
    console.log('Fetching ideas...');
    const result = await base44.ideas.list();
    console.log('Ideas fetched:', result);
    return result;
  },
});
```

**State updates:**
```javascript
setState(prev => {
  console.log('Previous state:', prev);
  const newState = { ...prev, updated: true };
  console.log('New state:', newState);
  return newState;
});
```

## Common Development Tasks

### Adding a New Component

1. **Create component file:**
```bash
touch src/components/feature/MyComponent.jsx
```

2. **Create component:**
```jsx
import React from 'react';

const MyComponent = ({ title }) => {
  return <div>{title}</div>;
};

export default MyComponent;
```

3. **Export from index (if using barrel exports):**
```javascript
// src/components/feature/index.js
export { default as MyComponent } from './MyComponent';
```

### Adding a New Page

1. **Create page file:**
```bash
touch src/pages/NewPage.jsx
```

2. **Create page component:**
```jsx
import React from 'react';

const NewPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1>New Page</h1>
    </div>
  );
};

export default NewPage;
```

3. **Add route:**
```javascript
// src/App.jsx or pages.config.js
import NewPage from './pages/NewPage';

// Add to routes
{
  path: '/new-page',
  element: <NewPage />
}
```

### Adding a New API Endpoint

If using Base44 cloud functions:

1. **Create function file:**
```bash
touch functions/myNewFunction.ts
```

2. **Implement function:**
```typescript
export default async function myNewFunction(context) {
  // Function logic
  return { success: true, data: {} };
}
```

3. **Call from React:**
```javascript
const result = await base44.functions.invoke('myNewFunction', {
  param: 'value'
});
```

### Adding a Custom Hook

1. **Create hook file:**
```bash
touch src/hooks/useMyHook.jsx
```

2. **Implement hook:**
```javascript
import { useState, useEffect } from 'react';

export function useMyHook(param) {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Hook logic
  }, [param]);

  return { data };
}
```

3. **Use in component:**
```javascript
import { useMyHook } from '@/hooks/useMyHook';

const { data } = useMyHook('param');
```

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update package-name

# Update all packages (careful!)
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Tips and Best Practices

### Performance

1. **Use React.memo for expensive components:**
```javascript
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});
```

2. **Use useCallback for event handlers:**
```javascript
const handleClick = useCallback(() => {
  // Handler logic
}, [dependency]);
```

3. **Use useMemo for expensive calculations:**
```javascript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

4. **Lazy load components:**
```javascript
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

### State Management

1. **Keep state close to where it's used**
2. **Lift state only when necessary**
3. **Use React Query for server state**
4. **Use local state for UI state**

### API Calls

1. **Always handle errors:**
```javascript
const { data, error } = useQuery({
  queryKey: ['ideas'],
  queryFn: () => base44.ideas.list(),
});

if (error) {
  return <ErrorMessage error={error} />;
}
```

2. **Use loading states:**
```javascript
if (isLoading) {
  return <LoadingSpinner />;
}
```

3. **Implement optimistic updates:**
```javascript
const mutation = useMutation({
  mutationFn: updateItem,
  onMutate: async (newData) => {
    // Optimistically update UI
  },
  onError: (err, newData, context) => {
    // Rollback on error
  },
});
```

### Styling

1. **Use Tailwind utilities first**
2. **Create custom CSS only when needed**
3. **Follow mobile-first approach**
4. **Use consistent spacing (4, 8, 16, 24, 32)**
5. **Maintain color consistency from config**

### Testing

1. **Write tests for new features**
2. **Test user interactions, not implementation**
3. **Use data-testid for selecting elements**
4. **Mock API calls in tests**

### Accessibility

1. **Use semantic HTML**
2. **Add ARIA labels where needed**
3. **Ensure keyboard navigation works**
4. **Test with screen readers**
5. **Maintain color contrast ratios**

## Related Documentation

- [Contributing Guide](../CONTRIBUTING.md)
- [Testing Guide](./TESTING.md)
- [API Documentation](./API.md)
- [Architecture Documentation](../ARCHITECTURE.md)

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-19  
**Maintained by**: Development Team
