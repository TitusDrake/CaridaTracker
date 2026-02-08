// This file runs BEFORE the test environment is set up
// Used to mock Expo SDK 54's winter runtime globals

// Mock structuredClone if not available
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mock Expo's import.meta registry (needed for SDK 54+)
globalThis.__ExpoImportMetaRegistry = {
  get: () => ({}),
  set: () => {},
};

// Mock import.meta
if (typeof globalThis.import === 'undefined') {
  globalThis.import = {};
}
