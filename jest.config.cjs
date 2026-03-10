const { createCjsPreset } = require('jest-preset-angular/presets');

const preset = createCjsPreset();

module.exports = {
  ...preset,
  clearMocks: true,
  collectCoverageFrom: [
    '<rootDir>/src/app/**/*.ts',
    '!<rootDir>/src/**/*.config.ts',
    '!<rootDir>/src/**/*.routes.ts',
    '!<rootDir>/src/main.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'html', 'lcov'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@layout/(.*)$': '<rootDir>/src/app/layout/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@features/(.*)$': '<rootDir>/src/app/features/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@testing/(.*)$': '<rootDir>/src/testing/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/testing/jest.setup.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
};
