# Contributing to Cerka Gig Work Platform

Thank you for your interest in contributing to the Cerka Gig Work Platform! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Supabase account

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/cerka-gig-work.git
   cd cerka-gig-work
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Update .env with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

### Component Structure
```typescript
// Component template
import React from 'react';

interface ComponentProps {
  // Define props with TypeScript
}

export function Component({ prop }: ComponentProps) {
  return (
    <div className="component-class">
      {/* Component content */}
    </div>
  );
}
```

### File Naming Conventions
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Pages: `PascalCase.tsx`
- Services: `camelCase.service.ts`

## 🔄 Workflow

### Branch Naming
- Feature: `feature/description`
- Bug fix: `fix/description`
- Hotfix: `hotfix/description`

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests if applicable
   - Update documentation

3. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature description"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/new-feature
   ```

5. **Create Pull Request**
   - Use the PR template
   - Link related issues
   - Request appropriate reviewers

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

## 🧪 Testing

### Running Tests
```bash
npm run test
```

### Writing Tests
- Write unit tests for utilities
- Write integration tests for services
- Write component tests for UI components

## 📚 Documentation

### Code Documentation
- Use JSDoc for functions
- Comment complex logic
- Update README for new features

### API Documentation
- Document new API endpoints
- Update service documentation
- Include example usage

## 🐛 Bug Reports

### Before Submitting
- Check existing issues
- Verify the bug exists
- Gather reproduction steps

### Bug Report Template
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.2.3]
```

## 💡 Feature Requests

### Before Submitting
- Check if feature already exists
- Consider if it fits the platform scope
- Think about implementation complexity

### Feature Request Template
```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives**
Other ways to solve the problem
```

## 🔒 Security

### Reporting Security Issues
- Email: security@cerka.rw
- Do not create public issues for security vulnerabilities
- Provide detailed reproduction steps

### Security Guidelines
- Never commit secrets or API keys
- Use environment variables for configuration
- Follow OWASP security practices
- Validate all user inputs

## 📖 Resources

### Documentation
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Platform Specific
- [Gig Work Platform Guide](./README.md)
- [Database Schema](./supabase/migrations/)
- [API Services](./src/services/)

## 🎯 Areas for Contribution

### High Priority
- Bug fixes
- Performance improvements
- Accessibility enhancements
- Test coverage

### Medium Priority
- New features
- UI/UX improvements
- Documentation updates
- Code refactoring

### Low Priority
- Code cleanup
- Minor optimizations
- Style improvements

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

## 📞 Getting Help

### Communication Channels
- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: General questions and ideas
- Email: dev@cerka.rw

### Response Times
- Bug reports: 24-48 hours
- Feature requests: 1-2 weeks
- Pull requests: 2-5 business days

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Cerka Gig Work Platform! 🚀