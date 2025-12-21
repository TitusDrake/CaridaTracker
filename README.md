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

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
