import type { Config } from 'jest';
import { createDefaultEsmPreset } from 'ts-jest';

const preset = createDefaultEsmPreset();

const config: Config = {
  ...preset,

  testEnvironment: 'node',

  roots: ['<rootDir>/src'],

  testMatch: ['**/*.test.ts'],

  moduleFileExtensions: ['ts', 'js'],

  extensionsToTreatAsEsm: ['.ts'],

  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],

  coverageDirectory: 'coverage',
};

export default config;
