import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),

  js.configs.recommended,

  ...tseslint.configs.recommended,

  prettierConfig,

  {
    files: ['**/*.{ts,tsx}'],

    plugins: {
      prettier: prettierPlugin,
      'simple-import-sort': simpleImportSort,
    },

    languageOptions: {
      globals: globals.browser,
    },

    rules: {
      eqeqeq: 'warn',
      curly: 'warn',
      'no-else-return': 'warn',

      'prettier/prettier': 'error',

      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
]);
