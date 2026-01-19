# Contributing to AI Passive Income Navigator

First off, thank you for considering contributing to AI Passive Income Navigator! It's people like you that make this project a great tool for discovering and managing passive income opportunities.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Style Guidelines](#style-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A GitHub account
- Basic knowledge of React, JavaScript/TypeScript, and Tailwind CSS

### Setup Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-passive-income-navigator.git
   cd ai-passive-income-navigator
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Krosebrook/ai-passive-income-navigator.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Base44 credentials
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, browser, Node version)

Use the bug report template when available.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Rationale** for the enhancement
- **Use case** examples
- **Possible implementation** approach (optional)

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `documentation` - Documentation improvements

### Pull Requests

1. Follow the [Development Workflow](#development-workflow)
2. Follow the [Style Guidelines](#style-guidelines)
3. Update documentation as needed
4. Add tests for new features
5. Ensure all tests pass
6. Follow the [Pull Request Process](#pull-request-process)

## Development Workflow

### Branch Naming

Use descriptive branch names:
- `feature/add-export-functionality`
- `fix/portfolio-calculation-bug`
- `docs/api-documentation`
- `refactor/cleanup-components`
- `test/add-portfolio-tests`

### Working on an Issue

1. **Sync with upstream**:
   ```bash
   git checkout main
   git fetch upstream
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** and commit regularly:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Keep your branch updated**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

## Style Guidelines

### JavaScript/React Style Guide

We use ESLint and Prettier for code formatting. Key conventions:

- Use **functional components** with hooks
- Use **arrow functions** for components
- Use **named exports** for components
- Use **PascalCase** for component names
- Use **camelCase** for functions and variables
- Use **UPPER_CASE** for constants
- Prefer **const** over let, avoid var
- Use **template literals** for string interpolation
- Add **PropTypes** or TypeScript types
- Write **meaningful comments** for complex logic

### Component Structure

```jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Brief description of the component
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The title to display
 * @param {Function} props.onAction - Callback function
 */
const MyComponent = ({ title, onAction }) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Effect logic
  }, []);

  const handleClick = () => {
    // Handler logic
  };

  return (
    <div className="container">
      <h1>{title}</h1>
      {/* Component JSX */}
    </div>
  );
};

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onAction: PropTypes.func,
};

export default MyComponent;
```

### CSS/Tailwind Guidelines

- Use **Tailwind utility classes** first
- Create **custom CSS** only when necessary
- Follow **mobile-first** responsive design
- Use **consistent spacing** (4, 8, 16, 24, 32, 64)
- Maintain **color consistency** from Tailwind config
- Use **semantic class names** for custom CSS

### File Organization

```
src/
├── api/              # API clients and configurations
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── [feature]/   # Feature-specific components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
├── pages/           # Page components
├── utils/           # Utility functions
└── test/            # Test utilities
```

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **chore**: Changes to build process or auxiliary tools
- **ci**: Changes to CI configuration files and scripts

### Examples

```bash
feat(portfolio): add export to CSV functionality

docs: update README with new installation steps

fix(dashboard): correct revenue calculation logic

test(ideas): add unit tests for idea filtering
```

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Run linting**:
   ```bash
   npm run lint
   npm run typecheck
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

5. **Update CHANGELOG.md** with your changes

6. **Fill out the PR template** completely

7. **Request review** from maintainers

8. **Address feedback** promptly

9. **Squash commits** if requested

### PR Title Format

Use the same format as commit messages:
```
feat(portfolio): add CSV export functionality
```

### PR Description

Include:
- **What** changes were made
- **Why** the changes were necessary
- **How** the changes were implemented
- **Testing** done
- **Screenshots** for UI changes
- **Related issues** (Fixes #123)

## Testing Guidelines

### Writing Tests

- Write tests for **new features**
- Write tests for **bug fixes**
- Aim for **minimum 40% coverage** for new code
- Use **descriptive test names**
- Follow **AAA pattern**: Arrange, Act, Assert

### Test Structure

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

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Questions?

Feel free to:
- Open an issue for questions
- Join our community discussions
- Contact the maintainers

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes
- Project documentation

Thank you for contributing! 🎉
