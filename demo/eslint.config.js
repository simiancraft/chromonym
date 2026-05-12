// ESLint flat config for the chromonym demo (Vite + React 18 + react-compiler).
// The library in ../src has no React code, so ESLint runs only here. Biome
// owns formatting and most lint rules across the repo; the job of this config
// is the one thing Biome cannot do today: surface React Compiler bailouts via
// eslint-plugin-react-compiler.
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import reactCompiler from 'eslint-plugin-react-compiler';

export default defineConfig([
  reactCompiler.configs.recommended,
  {
    name: 'chromonym-demo',
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['dist/**', 'node_modules/**'],
    // Parse TS/TSX with the typescript-eslint parser. We intentionally do NOT
    // pull in @typescript-eslint/eslint-plugin or its rule set; Biome owns
    // TypeScript linting in this repo. ESLint is here purely as a vehicle for
    // eslint-plugin-react-compiler, which Biome cannot run.
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // Surface all bailout severities, not just InvalidReact / InvalidJS.
      'react-compiler/react-compiler': [
        'error',
        {
          reportableLevels: new Set([
            'InvalidReact',
            'InvalidJS',
            'Todo',
            'CannotPreserveMemoization',
          ]),
        },
      ],

      // CONFLICT RESOLUTION: defer to Biome for these rules so the two
      // linters never disagree on the same source.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'import/order': 'off',
      'import/first': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
]);
