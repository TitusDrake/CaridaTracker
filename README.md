# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Code Quality & Linting

This project uses ESLint for code quality and consistency. ESLint is configured for React Native/Expo with recommended rules for mobile development.

### Running ESLint

Check for linting errors:

```bash
npm run lint
```

Auto-fix linting errors where possible:

```bash
npm run lint:fix
```

### ESLint Configuration

- Configuration file: `eslint.config.js`
- Uses `eslint-config-expo` for Expo/React Native best practices
- Ignored files: `node_modules/`, `.expo/`, generated files
- Rules enforce:
  - React/React Native best practices
  - Code quality standards
  - Consistent code style (semicolons, quotes, etc.)
  - React Hooks rules

### Pre-commit Linting

It's recommended to run `npm run lint` before committing code. Consider setting up a pre-commit hook (e.g., with husky) to automatically run linting.

## Testing

This project uses **Jest** and **React Native Testing Library** for component and functionality testing. All tests are located in `__tests__/`.

### Test Setup

Tests are configured to work with Expo and React Native. The setup includes:

- **Jest Preset:** `jest-expo` - Expo's Jest configuration
- **Testing Library:** `@testing-library/react-native` - React Native component testing
- **Test Location:** `__tests__/**/*.test.{ts,tsx}` or `**/*.test.{ts,tsx}`
- **Setup File:** `__tests__/setup.ts` - Configures mocks and test environment

### Running Tests

**Run all tests:**
```bash
npm test
```

**Run tests in watch mode** (automatically re-runs on file changes):
```bash
npm run test:watch
```

**Run tests with coverage report:**
```bash
npm run test:coverage
```

**Run a specific test file:**
```bash
npm test -- ThemedView.test.tsx
```

**Run tests matching a pattern:**
```bash
npm test -- --testNamePattern="renders correctly"
```

### Test Files

Current test coverage includes:

- ✅ `__tests__/components/ThemedView.test.tsx` - ThemedView component tests
- ✅ `__tests__/contexts/ThemeContext.test.tsx` - Theme context tests
- ✅ `__tests__/services/api.test.ts` - API service tests

### Test Structure

Tests use React Native Testing Library for component testing:

```typescript
import { render } from '@testing-library/react-native';
import { ThemedView } from '@/components/themed-view';

describe('ThemedView', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<ThemedView testID="test" />);
    expect(getByTestId('test')).toBeTruthy();
  });
});
```

### Test Configuration

- **Test Framework:** Jest with jest-expo preset
- **Test Environment:** React Native
- **Test Location:** `__tests__/**/*.test.{ts,tsx}`
- **Setup File:** `__tests__/setup.ts` (mocks AsyncStorage, expo-router, etc.)
- **Coverage:** Excludes type definitions, node_modules, .expo, and test files

### Important Notes

1. **Mocks:** The setup file automatically mocks:
   - `@react-native-async-storage/async-storage`
   - `expo-router` (useRouter, useSegments, etc.)

2. **Context Providers:** Tests that use contexts (ThemeContext, AuthContext) should wrap components with the appropriate providers.

3. **Async Operations:** Use `waitFor` and `act` from React Native Testing Library for async operations.

4. **VS Code Integration:** Test tasks are available in VS Code (Ctrl+Shift+P → "Tasks: Run Task" → "Run Tests")

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
