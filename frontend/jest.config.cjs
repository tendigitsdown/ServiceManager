module.exports = {
  preset: 'ts-jest', // Default preset
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.app.json', // Point to app's tsconfig
        compilerOptions: {
          esModuleInterop: true, // Force for Jest
          jsx: 'react-jsx', // Ensure JSX is handled
          // Add other options if verbatimModuleSyntax or module related issues reappear
          verbatimModuleSyntax: false, 
        },
        diagnostics: {
          ignoreCodes: ['TS151001'] // Ignore esModuleInterop warning from ts-jest
        }
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  clearMocks: true,
};
