# Contributing to MERN Music Playlist Manager

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size
- Race
- Ethnicity
- Age
- Religion
- Nationality

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:
- **Node.js** v18 or higher
- **Docker** and **Docker Compose**
- **Git**
- Code editor (VS Code recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/s-mern-playlist.git
cd s-mern-playlist
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/Alibibib/s-mern-playlist.git
```

### Setup Development Environment

1. Start MongoDB:

```bash
docker-compose up -d
```

2. Install dependencies:

```bash
cd server
npm install
```

3. Copy environment file:

```bash
cp .env.example .env
```

4. Start development server:

```bash
npm run dev
```

The server should now be running at `http://localhost:4000`

## 💻 Development Workflow

### Create a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates
- `chore/` - Maintenance tasks

### Make Your Changes

1. Write your code following our [coding standards](#coding-standards)
2. Add tests for new functionality
3. Update documentation if needed
4. Test your changes thoroughly

### Run Tests

Before committing, run:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

### Lint Your Code

Ensure your code passes linting:

```bash
# Run ESLint
npm run lint

# Auto-fix linting issues
npm run lint -- --fix
```

### Format Your Code

Format code with Prettier:

```bash
npm run format
```

### Commit Your Changes

Follow our [commit guidelines](#commit-guidelines):

```bash
git add .
git commit -m "feat: add playlist sharing feature"
```

### Keep Your Fork Updated

Regularly sync with upstream:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## 📝 Coding Standards

### TypeScript Guidelines

1. **Use TypeScript features**:
   ```typescript
   // Good
   interface User {
     id: string;
     username: string;
   }
   
   // Avoid
   const user: any = { ... };
   ```

2. **Explicit return types for functions**:
   ```typescript
   // Good
   function getUser(id: string): Promise<User> {
     // ...
   }
   
   // Avoid
   function getUser(id: string) {
     // ...
   }
   ```

3. **Use const over let when possible**:
   ```typescript
   // Good
   const userName = 'John';
   
   // Avoid
   let userName = 'John';
   ```

### Code Style

1. **Indentation**: 4 spaces (configured in `.editorconfig`)
2. **Line length**: Max 100 characters
3. **Quotes**: Single quotes for strings
4. **Semicolons**: Required
5. **Trailing commas**: Yes (for multiline)

### Naming Conventions

- **Variables/Functions**: camelCase
  ```typescript
  const userName = 'John';
  function getUserById() { }
  ```

- **Classes/Interfaces**: PascalCase
  ```typescript
  class UserService { }
  interface UserDocument { }
  ```

- **Constants**: UPPER_SNAKE_CASE
  ```typescript
  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  ```

- **Files**: kebab-case
  ```
  user-service.ts
  playlist-resolver.ts
  ```

### GraphQL Conventions

1. **Type names**: PascalCase
   ```graphql
   type User { }
   type Playlist { }
   ```

2. **Field names**: camelCase
   ```graphql
   type User {
     firstName: String!
     createdAt: String!
   }
   ```

3. **Input types**: Suffix with "Input"
   ```graphql
   input CreatePlaylistInput { }
   ```

4. **Enum values**: UPPER_SNAKE_CASE
   ```graphql
   enum ContributorRole {
     VIEWER
     EDITOR
     ADMIN
   }
   ```

### Error Handling

1. **Use try-catch for async operations**:
   ```typescript
   try {
     const result = await someAsyncOperation();
     return result;
   } catch (error) {
     throw new Error('Operation failed');
   }
   ```

2. **Throw GraphQL errors with appropriate codes**:
   ```typescript
   import { GraphQLError } from 'graphql';
   
   throw new GraphQLError('Not authenticated', {
     extensions: { code: 'UNAUTHENTICATED' }
   });
   ```

### Comments

1. **Use JSDoc for public functions**:
   ```typescript
   /**
    * Uploads a file to GridFS
    * @param file - The file to upload
    * @param metadata - Additional metadata
    * @returns The file ID
    */
   async function uploadFile(file: File, metadata: Metadata): Promise<string> {
     // ...
   }
   ```

2. **Explain "why" not "what"**:
   ```typescript
   // Good
   // Hash password before storing to prevent plaintext exposure
   const hashedPassword = await bcrypt.hash(password, 10);
   
   // Avoid
   // Hash the password
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **perf**: Performance improvements

### Examples

```bash
# Feature
feat(playlist): add collaborative editing

# Bug fix
fix(auth): prevent token expiration edge case

# Documentation
docs(api): update authentication examples

# Refactor
refactor(resolver): simplify playlist query logic

# Test
test(upload): add file validation tests
```

### Scope

Optional, specifies the area of change:
- `auth` - Authentication
- `playlist` - Playlist features
- `song` - Song features
- `upload` - File upload
- `api` - API changes
- `db` - Database changes

## 🔄 Pull Request Process

### Before Submitting

1. ✅ Code follows style guidelines
2. ✅ Tests pass locally
3. ✅ Linting passes
4. ✅ Documentation updated
5. ✅ Commits follow guidelines
6. ✅ Branch is up-to-date with main

### PR Title

Follow the same format as commit messages:

```
feat(playlist): add collaborative editing feature
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. At least one maintainer approval required
2. All CI checks must pass
3. No unresolved comments
4. Up-to-date with main branch

### After Approval

1. Maintainer will merge using "Squash and merge"
2. Delete your branch after merge
3. Update your local repository

## 🐛 Reporting Bugs

### Before Reporting

1. Check existing issues
2. Update to latest version
3. Check documentation

### Bug Report Template

```markdown
**Describe the Bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 10]
- Node version: [e.g., 18.0.0]
- Browser: [e.g., Chrome 100]

**Additional Context**
Any other relevant information
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Is your feature related to a problem?**
Clear description of the problem

**Describe the solution**
How should it work?

**Describe alternatives**
Other solutions you've considered

**Additional context**
Mockups, examples, etc.
```

## 🧪 Testing Guidelines

### Writing Tests

1. **Test file naming**: `*.test.ts`
2. **Location**: Same directory as source file or `__tests__` folder
3. **Coverage**: Aim for >80% coverage

### Test Structure

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user', async () => {
      // Arrange
      const userData = { ... };
      
      // Act
      const user = await createUser(userData);
      
      // Assert
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
    });
    
    it('should throw error for duplicate email', async () => {
      // Test error case
    });
  });
});
```

### Test Types

1. **Unit Tests**: Test individual functions
2. **Integration Tests**: Test API endpoints
3. **E2E Tests**: Test complete workflows

## 📚 Documentation

### What to Document

1. **API changes**: Update API_DOCUMENTATION.md
2. **Architecture changes**: Update ARCHITECTURE.md
3. **New features**: Update README.md
4. **Breaking changes**: Add migration guide

### Documentation Style

- Use clear, concise language
- Include code examples
- Add screenshots for UI
- Keep it up-to-date

## ❓ Questions?

If you have questions:
1. Check existing documentation
2. Search closed issues
3. Ask in discussions
4. Contact maintainers

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

---

**Happy Contributing! 🎵**
