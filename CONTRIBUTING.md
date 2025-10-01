# Contributing to AI-Powered Job Application System

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project follows a professional code of conduct. We expect all contributors to:

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the project
- Show empathy towards other contributors

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Supabase account
- An Anthropic API key

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-job-application.git
   cd ai-job-application
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

5. Add your credentials to `.env.local`

6. Run the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Development branch (if used)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring

### Creating a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-you-are-fixing
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types, avoid `any`
- Use interfaces for object shapes
- Export types from `types/` directory

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in objects/arrays
- Use meaningful variable names
- Keep functions small and focused

### File Organization

```
app/
  api/          # API routes
  (pages)/      # Page routes
lib/
  claude/       # Claude AI integration
  supabase/     # Supabase utilities
types/          # TypeScript types
components/     # Reusable components
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (`User`, `ApplicationData`)

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(api): add endpoint for batch question generation

Add new API endpoint to generate questions for multiple jobs at once.
Includes rate limiting and error handling.

Closes #123
```

```
fix(resume-parser): handle missing education section

Resume parser was crashing when education section was missing.
Now defaults to empty array.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. **Update your branch** with the latest main:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Run tests** (when available):
   ```bash
   npm run test
   ```

3. **Check types**:
   ```bash
   npm run type-check
   ```

4. **Lint your code**:
   ```bash
   npm run lint
   ```

5. **Test locally**:
   - Test all affected features
   - Verify no console errors
   - Check mobile responsiveness (if UI changes)

### Submitting a PR

1. Push your branch to your fork:
   ```bash
   git push origin your-branch
   ```

2. Create a pull request on GitHub

3. Fill out the PR template completely

4. Link any related issues

5. Request review from maintainers

### PR Requirements

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console warnings/errors
- [ ] Types are properly defined
- [ ] Tested locally

### Review Process

- Maintainers will review within 2-3 days
- Address all review comments
- Push updates to the same branch
- Request re-review when ready

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Place test files next to the code they test
- Name test files: `*.test.ts` or `*.spec.ts`
- Write descriptive test names
- Test edge cases and error scenarios

Example:
```typescript
describe('analyzeInterviewResponse', () => {
  it('should return analysis with score between 0-5', async () => {
    const result = await analyzeInterviewResponse({
      questionText: 'Test question',
      candidateResponse: 'Test answer',
      // ...
    });

    expect(result.analysis.score).toBeGreaterThanOrEqual(0);
    expect(result.analysis.score).toBeLessThanOrEqual(5);
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments for functions:
  ```typescript
  /**
   * Generates interview questions for a job posting
   * @param params - Job details and requirements
   * @returns Generated questions with evaluation criteria
   */
  export async function generateInterviewQuestions(
    params: GenerateQuestionsParams
  ): Promise<GenerateQuestionsResult> {
    // ...
  }
  ```

- Document complex logic with inline comments
- Keep comments up-to-date with code changes

### README Updates

- Update README.md if you add features
- Include usage examples
- Update API documentation
- Add to roadmap if applicable

### Documentation Site

- Major features should have dedicated docs
- Include code examples
- Add screenshots for UI features
- Keep docs in `docs/` directory

## Working with Claude API

### Best Practices

- Test prompts thoroughly
- Use appropriate models (Sonnet vs Haiku)
- Handle rate limits gracefully
- Log token usage for monitoring
- Cache results when possible

### Prompt Changes

When modifying prompts in `lib/claude/prompts.ts`:
- Test with various inputs
- Document expected output format
- Include examples in comments
- Consider token usage

## Working with Supabase

### Database Changes

- Update `supabase-schema.sql`
- Test migrations locally first
- Update TypeScript types in `types/database.ts`
- Document schema changes

### RLS Policies

- Always use Row Level Security
- Test policies thoroughly
- Document policy logic
- Consider performance impact

## Environment Variables

- Never commit `.env.local`
- Update `.env.example` for new variables
- Document new variables in README
- Use descriptive variable names

## Performance Considerations

- Minimize Claude API calls
- Use appropriate caching
- Optimize database queries
- Monitor bundle size
- Use Next.js Image component

## Security

- Validate all user inputs
- Sanitize data before storage
- Use parameterized queries
- Never expose API keys
- Follow OWASP guidelines

## Getting Help

- Check existing issues and PRs
- Read the documentation
- Ask in discussions
- Tag maintainers in PRs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
