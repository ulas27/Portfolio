# 🤝 Contributing to TırNav

Thank you for your interest in contributing to TırNav! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## 🚀 Getting Started

### Prerequisites

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/tirnav.git
   cd tirnav
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment**
   ```bash
   cp .env.template .env
   # Add your API keys
   ```

5. **Run the app**
   ```bash
   npm start
   ```

---

## 🔄 Development Process

### 1. Create a Branch

```bash
# For new features
git checkout -b feature/your-feature-name

# For bug fixes
git checkout -b fix/bug-description

# For documentation
git checkout -b docs/what-you-are-documenting
```

### 2. Make Your Changes

- Write clean, readable code
- Follow our coding standards
- Add tests if applicable
- Update documentation

### 3. Test Your Changes

```bash
# Run tests
npm test

# Test on device/simulator
npm run android
npm run ios
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add amazing feature"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

Go to the original repository and create a pull request.

---

## 💻 Coding Standards

### TypeScript

```typescript
// ✅ Use TypeScript for type safety
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Use explicit types
function getUser(id: string): User {
  // ...
}

// ❌ Avoid 'any' type
function badFunction(data: any) { } // Don't do this
```

### Naming Conventions

```typescript
// ✅ camelCase for functions and variables
const userName = 'John';
function calculateTotal() { }

// ✅ PascalCase for components and classes
function UserProfile() { }
class UserService { }

// ✅ UPPER_SNAKE_CASE for constants
const API_KEY = 'xxx';
const MAX_RETRIES = 3;

// ✅ Prefix booleans with is/has/should
const isLoading = true;
const hasError = false;
const shouldUpdate = true;
```

### Component Structure

```typescript
/**
 * Component description
 * 
 * @example
 * ```tsx
 * <MyComponent title="Hello" onPress={() => {}} />
 * ```
 */
import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';
import type { MyComponentProps } from './types';

export default function MyComponent({ title, onPress }: MyComponentProps) {
  // Hooks first
  const [state, setState] = useState();
  
  // Event handlers
  const handlePress = () => {
    // ...
  };
  
  // Render
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
}
```

### File Organization

```
ComponentName/
├── index.tsx          # Main component
├── styles.ts          # Styles
├── types.ts           # TypeScript types
└── components/        # Sub-components (if needed)
    ├── SubComponent1.tsx
    └── SubComponent2.tsx
```

### Comments

```typescript
/**
 * JSDoc for functions
 * 
 * @param userId - User ID
 * @param options - Optional parameters
 * @returns User object
 * @throws {Error} If user not found
 */
export async function getUser(
  userId: string,
  options?: GetUserOptions
): Promise<User> {
  // Implementation
}

// Single line comments for clarification
const total = price * quantity; // Calculate total price
```

---

## 📝 Commit Guidelines

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
- **style**: Code style changes (formatting, missing semi-colons, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Build process or auxiliary tool changes

### Examples

```bash
# Feature
git commit -m "feat(map): add route calculation"

# Bug fix
git commit -m "fix(auth): resolve login issue"

# Documentation
git commit -m "docs(readme): update installation steps"

# With body
git commit -m "feat(warnings): add photo upload

- Implement image picker
- Add image compression
- Upload to Firebase Storage"
```

---

## 🔀 Pull Request Process

### Before Submitting

1. **Update your branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**
   ```bash
   npm test
   ```

3. **Check linting**
   ```bash
   npm run lint
   ```

4. **Update documentation**
   - Update README if needed
   - Add JSDoc comments
   - Update CHANGELOG

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on Android
- [ ] Tested on iOS
- [ ] Added unit tests
- [ ] Updated documentation

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] All tests pass
```

### Review Process

1. Maintainer will review your PR
2. Address any requested changes
3. Once approved, PR will be merged

---

## 🧪 Testing

### Unit Tests

```typescript
// __tests__/services/auth.test.ts
import { authService } from '@services/firebase/auth';

describe('Auth Service', () => {
  it('should sign in user', async () => {
    const user = await authService.signIn({
      email: 'test@example.com',
      password: 'password123',
    });
    
    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
```

### Component Tests

```typescript
// __tests__/components/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '@components/common/Button';

describe('Button Component', () => {
  it('should render correctly', () => {
    const { getByText } = render(<Button title="Click me" />);
    expect(getByText('Click me')).toBeDefined();
  });
  
  it('should call onPress when clicked', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Click me" onPress={onPress} />
    );
    
    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

---

## 📚 Additional Resources

- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)

---

## ❓ Questions?

If you have questions, please:
1. Check existing issues
2. Read the documentation
3. Ask in our Discord community
4. Create a new issue

---

## 🙏 Thank You!

Thank you for contributing to TırNav! Your efforts help make this project better for everyone.

---

<div align="center">

**Happy Coding! 🚛💨**

</div>
