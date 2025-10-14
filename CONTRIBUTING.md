# Contributing to NextBase

Thank you for your interest in contributing to NextBase! We welcome contributions from the community and are grateful for your support.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow. Please be respectful and constructive in your interactions with other contributors.

## Getting Started

### Prerequisites

- **Node.js** 18+ and **pnpm** installed
- **Supabase** account for testing
- **Git** installed

### Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/upnorthmedia/nextbase.git
   cd nextbase
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Set up your environment variables:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

5. Run database migrations in your Supabase project:
   - Go to Supabase Dashboard → SQL Editor
   - Run the migration in `supabase/migrations/00000000000000_complete_schema.sql`

6. Start the development server:
   ```bash
   pnpm dev
   ```

## Development Workflow

1. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes** thoroughly:
   - Test auth flow
   - Test blog functionality
   - Test admin features
   - Verify responsive design

4. **Commit your changes** with a clear commit message:
   ```bash
   git commit -m "feat: add new feature"
   ```

   We follow conventional commits:
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation changes
   - `style:` formatting, missing semicolons, etc.
   - `refactor:` code restructuring
   - `test:` adding tests
   - `chore:` maintenance tasks

## Pull Request Process

1. **Update documentation** if you've made changes to:
   - API endpoints
   - Database schema
   - Environment variables
   - User-facing features

2. **Ensure all checks pass**:
   - Code builds successfully (`pnpm build`)
   - ESLint passes (`pnpm lint`)
   - TypeScript compiles without errors

3. **Create a pull request**:
   - Provide a clear description of the changes
   - Reference any related issues
   - Include screenshots for UI changes
   - List any breaking changes

4. **Address review feedback** promptly and professionally

5. **Keep your PR focused** - one feature or fix per PR when possible

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Define proper types - avoid `any`
- Use interfaces for object shapes
- Export types when they're used across files

### Code Style

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Add **trailing commas** in multi-line objects/arrays
- Use **async/await** over promises
- Follow existing file structure patterns

### React/Next.js

- Use **Server Components** by default
- Only add `'use client'` when necessary
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks or utilities

### Database

- Never bypass RLS policies
- Test all database changes with different user roles
- Document any new tables or columns
- Include proper indexes for performance

### Authentication

- Never log sensitive data (passwords, tokens, keys)
- Follow existing authentication patterns
- Test auth flows thoroughly
- Validate all user input

## Reporting Bugs

### Before Submitting

- Check existing issues to avoid duplicates
- Test on the latest version
- Gather relevant information (browser, OS, Node version)

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome 120, Firefox 121]
- Node version: [e.g., 18.17.0]
- Next.js version: [check package.json]
```

## Suggesting Enhancements

We welcome feature suggestions! Please:

1. **Check existing issues** for similar suggestions
2. **Provide a clear use case** for the feature
3. **Explain the expected behavior**
4. **Consider implementation** (optional but helpful)

### Enhancement Template

```markdown
**Feature Description**
Clear description of the proposed feature.

**Use Case**
Why is this feature needed? Who will benefit?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Any alternative solutions or features you've considered.

**Additional Context**
Mockups, examples, or related features.
```

## Questions?

Feel free to:
- Open a **Discussion** for questions
- Join our community (if applicable)
- Reach out to maintainers

---

Thank you for contributing to NextBase! 🎉
