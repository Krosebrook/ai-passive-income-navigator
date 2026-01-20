# JSDoc Documentation Examples

This document provides examples of how to properly document JavaScript/React code using JSDoc comments.

## Table of Contents

- [Why JSDoc?](#why-jsdoc)
- [Basic Function Documentation](#basic-function-documentation)
- [React Component Documentation](#react-component-documentation)
- [Custom Hooks Documentation](#custom-hooks-documentation)
- [Type Definitions](#type-definitions)
- [API Function Documentation](#api-function-documentation)
- [Utility Function Documentation](#utility-function-documentation)
- [Best Practices](#best-practices)

## Why JSDoc?

JSDoc provides:
- **Better IDE support** - IntelliSense and autocomplete
- **Type safety** - Without TypeScript overhead
- **Inline documentation** - Visible while coding
- **Generated documentation** - Can create API docs automatically

## Basic Function Documentation

### Simple Function

```javascript
/**
 * Calculates the sum of two numbers
 * 
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The sum of a and b
 * 
 * @example
 * add(2, 3) // Returns: 5
 */
function add(a, b) {
  return a + b;
}
```

### Function with Optional Parameters

```javascript
/**
 * Formats a currency amount
 * 
 * @param {number} amount - The amount to format
 * @param {string} [currency='USD'] - Currency code (optional, defaults to USD)
 * @param {Object} [options] - Formatting options (optional)
 * @param {string} [options.locale='en-US'] - Locale for formatting
 * @param {number} [options.decimals=2] - Number of decimal places
 * @returns {string} Formatted currency string
 * 
 * @example
 * formatCurrency(1234.56)
 * // Returns: '$1,234.56'
 * 
 * @example
 * formatCurrency(1234.56, 'EUR', { locale: 'de-DE' })
 * // Returns: '1.234,56 €'
 */
function formatCurrency(amount, currency = 'USD', options = {}) {
  const { locale = 'en-US', decimals = 2 } = options;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals
  }).format(amount);
}
```

### Async Function

```javascript
/**
 * Fetches user data from the API
 * 
 * @async
 * @param {string} userId - The user's ID
 * @returns {Promise<User>} A promise that resolves to the user object
 * @throws {Error} If the user is not found or API request fails
 * 
 * @example
 * try {
 *   const user = await fetchUser('user-123');
 *   console.log(user.name);
 * } catch (error) {
 *   console.error('Failed to fetch user:', error);
 * }
 */
async function fetchUser(userId) {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error(`User not found: ${userId}`);
  }
  return response.json();
}
```

## React Component Documentation

### Functional Component

```javascript
/**
 * A button component with various styles and states
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.label - Button text
 * @param {'primary'|'secondary'|'danger'} [props.variant='primary'] - Button style variant
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {boolean} [props.loading=false] - Whether to show loading state
 * @param {Function} [props.onClick] - Click handler
 * @returns {React.ReactElement} The button component
 * 
 * @example
 * <Button 
 *   label="Submit" 
 *   variant="primary" 
 *   onClick={handleSubmit} 
 * />
 * 
 * @example
 * // With loading state
 * <Button 
 *   label="Save" 
 *   loading={isSaving} 
 *   disabled={isSaving}
 *   onClick={handleSave}
 * />
 */
const Button = ({ 
  label, 
  variant = 'primary', 
  disabled = false, 
  loading = false,
  onClick 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? 'Loading...' : label}
    </button>
  );
};

Button.propTypes = {
  label: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
};

export default Button;
```

### Component with Complex Props

```javascript
/**
 * Displays a portfolio card with idea information
 * 
 * @component
 * @param {Object} props - Component props
 * @param {PortfolioItem} props.item - The portfolio item to display
 * @param {Function} props.onEdit - Callback when edit is clicked
 * @param {Function} props.onDelete - Callback when delete is clicked
 * @param {boolean} [props.isEditable=true] - Whether the card can be edited
 * @returns {React.ReactElement} The portfolio card component
 * 
 * @typedef {Object} PortfolioItem
 * @property {string} id - Unique identifier
 * @property {string} title - Item title
 * @property {string} status - Current status
 * @property {number} revenue - Current revenue
 * @property {number} expenses - Current expenses
 * @property {Date} startDate - When the item started
 * 
 * @example
 * const item = {
 *   id: '123',
 *   title: 'E-commerce Store',
 *   status: 'active',
 *   revenue: 5000,
 *   expenses: 2000,
 *   startDate: new Date('2024-01-01')
 * };
 * 
 * <PortfolioCard
 *   item={item}
 *   onEdit={(id) => console.log('Edit', id)}
 *   onDelete={(id) => console.log('Delete', id)}
 * />
 */
const PortfolioCard = ({ item, onEdit, onDelete, isEditable = true }) => {
  // Component implementation
};
```

## Custom Hooks Documentation

### Simple Hook

```javascript
/**
 * Custom hook for managing boolean toggle state
 * 
 * @hook
 * @param {boolean} [initialValue=false] - Initial state value
 * @returns {[boolean, Function, Function, Function]} Tuple of [state, toggle, setTrue, setFalse]
 * 
 * @example
 * const [isOpen, toggle, open, close] = useToggle(false);
 * 
 * // Toggle state
 * toggle(); // isOpen becomes true
 * 
 * // Set to true
 * open();
 * 
 * // Set to false
 * close();
 */
function useToggle(initialValue = false) {
  const [state, setState] = useState(initialValue);
  
  const toggle = useCallback(() => setState(s => !s), []);
  const setTrue = useCallback(() => setState(true), []);
  const setFalse = useCallback(() => setState(false), []);
  
  return [state, toggle, setTrue, setFalse];
}
```

### Complex Hook with API

```javascript
/**
 * Hook for fetching and managing portfolio items
 * 
 * @hook
 * @param {Object} options - Hook options
 * @param {boolean} [options.autoRefetch=true] - Auto refetch on mount
 * @param {number} [options.refetchInterval] - Refetch interval in ms
 * @returns {UsePortfolioReturn} Portfolio data and methods
 * 
 * @typedef {Object} UsePortfolioReturn
 * @property {PortfolioItem[]} items - Array of portfolio items
 * @property {boolean} isLoading - Whether data is loading
 * @property {Error|null} error - Error if any
 * @property {Function} refetch - Function to refetch data
 * @property {Function} addItem - Function to add new item
 * @property {Function} updateItem - Function to update item
 * @property {Function} deleteItem - Function to delete item
 * 
 * @example
 * const { 
 *   items, 
 *   isLoading, 
 *   error, 
 *   addItem, 
 *   updateItem 
 * } = usePortfolio({ autoRefetch: true });
 * 
 * // Add new item
 * await addItem({ 
 *   title: 'New Project',
 *   status: 'planning'
 * });
 * 
 * // Update item
 * await updateItem('item-id', { 
 *   status: 'active',
 *   revenue: 1000
 * });
 */
function usePortfolio(options = {}) {
  const { autoRefetch = true, refetchInterval } = options;
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => base44.portfolioItems.list(),
    refetchInterval,
    enabled: autoRefetch
  });
  
  const addItemMutation = useMutation({
    mutationFn: (data) => base44.portfolioItems.create(data),
    onSuccess: () => refetch()
  });
  
  // ... more implementation
  
  return {
    items: data || [],
    isLoading,
    error,
    refetch,
    addItem: addItemMutation.mutateAsync,
    // ... more methods
  };
}
```

## Type Definitions

### Basic Types

```javascript
/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string[]} roles - User roles
 * @property {Date} createdAt - Account creation date
 */

/**
 * @typedef {Object} Idea
 * @property {string} id - Idea ID
 * @property {string} title - Idea title
 * @property {string} description - Idea description
 * @property {('beginner'|'intermediate'|'advanced')} difficulty - Difficulty level
 * @property {number} initialInvestment - Required initial investment
 * @property {string[]} tags - Associated tags
 */
```

### Complex Types

```javascript
/**
 * @typedef {Object} APIResponse
 * @property {boolean} success - Whether the request was successful
 * @property {*} [data] - Response data (if successful)
 * @property {string} [error] - Error message (if failed)
 * @property {Object} [meta] - Additional metadata
 * @property {number} meta.total - Total count
 * @property {number} meta.page - Current page
 * @property {number} meta.perPage - Items per page
 */

/**
 * @typedef {Object} QueryOptions
 * @property {number} [limit=20] - Number of items to return
 * @property {number} [offset=0] - Number of items to skip
 * @property {string} [orderBy='createdAt'] - Field to order by
 * @property {('asc'|'desc')} [order='desc'] - Sort direction
 * @property {Object} [filter] - Filter criteria
 */
```

## API Function Documentation

```javascript
/**
 * Fetches ideas from the API with optional filtering and pagination
 * 
 * @async
 * @param {QueryOptions} [options={}] - Query options
 * @returns {Promise<APIResponse>} Promise resolving to API response
 * @throws {Error} If API request fails
 * 
 * @example
 * // Fetch first 10 ideas
 * const result = await fetchIdeas({ limit: 10 });
 * console.log(result.data); // Array of ideas
 * 
 * @example
 * // Fetch with filtering
 * const result = await fetchIdeas({
 *   filter: { category: 'e-commerce' },
 *   orderBy: 'title',
 *   order: 'asc'
 * });
 * 
 * @example
 * // Error handling
 * try {
 *   const result = await fetchIdeas();
 * } catch (error) {
 *   console.error('Failed to fetch ideas:', error);
 * }
 */
async function fetchIdeas(options = {}) {
  const { 
    limit = 20, 
    offset = 0, 
    orderBy = 'createdAt',
    order = 'desc',
    filter = {}
  } = options;
  
  try {
    const response = await base44.ideas.list({
      limit,
      offset,
      orderBy,
      order,
      filter
    });
    
    return {
      success: true,
      data: response.data,
      meta: {
        total: response.total,
        page: Math.floor(offset / limit) + 1,
        perPage: limit
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

## Utility Function Documentation

```javascript
/**
 * Validates an email address
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid, false otherwise
 * 
 * @example
 * isValidEmail('user@example.com') // Returns: true
 * isValidEmail('invalid-email') // Returns: false
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Debounces a function call
 * 
 * @template T
 * @param {T} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {T} Debounced function
 * 
 * @example
 * const debouncedSearch = debounce((query) => {
 *   searchAPI(query);
 * }, 300);
 * 
 * // Call multiple times
 * debouncedSearch('a');
 * debouncedSearch('ab');
 * debouncedSearch('abc');
 * // Only the last call will execute after 300ms
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clones an object
 * 
 * @template T
 * @param {T} obj - Object to clone
 * @returns {T} Cloned object
 * 
 * @example
 * const original = { a: 1, b: { c: 2 } };
 * const cloned = deepClone(original);
 * cloned.b.c = 3;
 * console.log(original.b.c); // Still 2
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
```

## Best Practices

### 1. Always Document Public APIs

```javascript
// ✅ Good
/**
 * Calculates total revenue
 * @param {PortfolioItem[]} items - Portfolio items
 * @returns {number} Total revenue
 */
export function calculateTotalRevenue(items) {
  return items.reduce((sum, item) => sum + item.revenue, 0);
}

// ❌ Bad: No documentation
export function calculateTotalRevenue(items) {
  return items.reduce((sum, item) => sum + item.revenue, 0);
}
```

### 2. Include Examples

```javascript
/**
 * Formats a date
 * @param {Date} date - Date to format
 * @param {string} format - Format string
 * @returns {string} Formatted date
 * 
 * @example
 * formatDate(new Date('2024-01-15'), 'YYYY-MM-DD')
 * // Returns: '2024-01-15'
 */
function formatDate(date, format) {
  // Implementation
}
```

### 3. Document All Parameters

```javascript
/**
 * Creates a new user
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {Object} options - Additional options
 * @param {string[]} options.roles - User roles
 * @param {boolean} options.sendEmail - Whether to send welcome email
 */
function createUser(name, email, options) {
  // Implementation
}
```

### 4. Use Type Definitions

```javascript
/**
 * @typedef {Object} Config
 * @property {string} apiUrl - API base URL
 * @property {number} timeout - Request timeout
 * @property {boolean} debug - Debug mode
 */

/**
 * Initializes the application
 * @param {Config} config - Application configuration
 */
function initialize(config) {
  // Implementation
}
```

### 5. Document Return Types

```javascript
/**
 * Fetches user data
 * @returns {Promise<User>} User object
 * @returns {Promise<null>} If user not found
 */
async function getUser(id) {
  // Implementation
}
```

### 6. Document Exceptions

```javascript
/**
 * Divides two numbers
 * @param {number} a - Numerator
 * @param {number} b - Denominator
 * @returns {number} Result
 * @throws {Error} If b is zero
 */
function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}
```

## Tools and IDE Support

### VS Code Extensions

- **IntelliSense** - Built-in JSDoc support
- **Document This** - Auto-generate JSDoc comments
- **Better Comments** - Enhanced comment highlighting

### Generating Documentation

```bash
# Using JSDoc CLI
npm install -g jsdoc
jsdoc src/**/*.js -d docs

# Using documentation.js
npm install -g documentation
documentation build src/** -f html -o docs
```

## Related Documentation

- [Development Guide](./DEVELOPMENT.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [API Documentation](./API.md)

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-19  
**Maintained by**: Development Team
