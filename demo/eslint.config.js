// ESLint exists in this repo for one rule Biome cannot run:
// react-compiler bailouts. Biome owns formatting + lint everywhere
// it's included; demo/ is out of biome.json's `files.includes`, so
// ESLint covers React Compiler hygiene for the demo only.
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import reactCompiler from 'eslint-plugin-react-compiler';

export default defineConfig([
  reactCompiler.configs.recommended,
  {
    name: 'chromonym-demo',
    files: ['**/*.{ts,tsx}'],
    ignores: ['dist/**', 'node_modules/**'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // Surface all four bailout severities. `Todo` is load-bearing:
      // the compiler tags components it can't memoize (try/catch value
      // blocks, certain async patterns) as Todo and skips them. Without
      // this we'd silently drop memoization on real components.
      // Set is required; the plugin checks `instanceof Set` and falls
      // back to defaults for any other shape.
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
    },
  },
]);
