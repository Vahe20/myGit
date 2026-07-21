const { createDefaultEsmPreset } = require('ts-jest');

const preset = createDefaultEsmPreset();

module.exports = {
  ...preset,

  testEnvironment: 'node',

  roots: ['<rootDir>/src'],

  testMatch: ['**/*.test.ts'],

  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],

  coverageDirectory: 'coverage',
};
