import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
export default defineConfig([
  globalIgnores(['dist']),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { prettier: prettierPlugin },
    languageOptions: { globals: globals.browser },
    rules: {
      eqeqeq: 'warn',
      curly: 'warn',
      'no-else-return': 'warn',
      'prettier/prettier': 'error',
    },
  },
]);
