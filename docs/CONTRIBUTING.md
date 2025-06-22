# Contributing to ApplicationBuddy

## Overview

Thank you for your interest in contributing to ApplicationBuddy! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites

1. **Development Environment**
   - Node.js (v18 or later)
   - npm (v8 or later)
   - Git
   - Firebase CLI
   - Chrome/Firefox for extension development

2. **Accounts**
   - GitHub account
   - Firebase account
   - Vercel account (for deployment)

### Setup

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub
   # Clone your fork
   git clone https://github.com/your-username/applicationbuddy.git
   cd applicationbuddy
   ```

2. **Install Dependencies**
   ```bash
   # Install project dependencies
   npm install
   
   # Install extension dependencies
   cd extension
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Configure environment variables
   # See SETUP.md for required variables
   ```

## Development Workflow

### 1. Branch Management

```bash
# Create a new branch
git checkout -b feature/your-feature-name

# For bug fixes
git checkout -b fix/issue-description
```

### 2. Code Style

1. **TypeScript**
   - Follow TypeScript best practices
   - Use strict type checking
   - Document complex types

2. **React Components**
   - Use functional components
   - Implement proper prop types
   - Follow React best practices

3. **Testing**
   - Write unit tests for new features
   - Maintain test coverage
   - Follow testing best practices

### 3. Commit Guidelines

```bash
# Format: type(scope): description

# Examples:
feat(auth): add Google OAuth integration
fix(api): resolve CORS issues
docs(readme): update installation instructions
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Testing
- `chore`: Maintenance

### 4. Pull Request Process

1. **Before Submitting**
   - Update documentation
   - Add tests
   - Ensure all tests pass
   - Update changelog

2. **PR Description**
   ```markdown
   ## Description
   Brief description of changes

   ## Related Issues
   Fixes #123

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation
   - [ ] Other

   ## Checklist
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] Code follows style guidelines
   ```

## Project Structure

```
applicationbuddy/
├── api/              # API routes and services
├── components/       # React components
├── extension/        # Browser extension
├── lib/             # Shared utilities
├── pages/           # Next.js pages
├── public/          # Static assets
└── styles/          # CSS styles
```

## Testing

### 1. Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test.ts

# Run with coverage
npm test -- --coverage
```

### 2. Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run specific integration test
npm run test:integration -- path/to/test.ts
```

### 3. E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- path/to/test.ts
```

## Documentation

### 1. Code Documentation

```typescript
/**
 * Function description
 * @param {string} param1 - Parameter description
 * @returns {Promise<Type>} Return value description
 */
```

### 2. API Documentation

```typescript
/**
 * @api {post} /api/endpoint Endpoint description
 * @apiName EndpointName
 * @apiGroup Group
 * @apiParam {String} param1 Parameter description
 * @apiSuccess {Object} response Response description
 */
```

## Review Process

1. **Code Review**
   - Review for functionality
   - Check code style
   - Verify tests
   - Review documentation

2. **Approval Process**
   - At least one approval required
   - All tests must pass
   - No merge conflicts
   - Documentation updated

## Deployment

### 1. Web Application

```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

### 2. Browser Extension

```bash
# Build extension
npm run build:extension

# Package for stores
npm run package:extension
```

## Support

### 1. Getting Help

- Check documentation
- Search issues
- Join community chat
- Contact maintainers

### 2. Reporting Issues

```markdown
## Issue Description
Detailed description of the issue

## Steps to Reproduce
1. Step one
2. Step two

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 90]
- Node.js: [e.g., v18.0.0]
```

## Code of Conduct

1. **Be Respectful**
   - Respect all contributors
   - Be patient and helpful
   - Accept constructive criticism

2. **Be Professional**
   - Use professional language
   - Stay on topic
   - Follow project guidelines

3. **Be Collaborative**
   - Help others
   - Share knowledge
   - Work together

## License

By contributing to ApplicationBuddy, you agree that your contributions will be licensed under the project's MIT License. 