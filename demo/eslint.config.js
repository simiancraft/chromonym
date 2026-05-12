// ESLint exists in this repo for the React-specific rules Biome cannot
// run today: rules-of-hooks and react-compiler bailouts. Biome owns
// formatting + lint everywhere it's included; demo/ is out of
// biome.json's `files.includes`, so ESLint covers demo React hygiene.
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import reactCompiler from 'eslint-plugin-react-compiler';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  reactCompiler.configs.recommended,
  {
    name: 'chromonym-demo',
    files: ['**/*.{ts,tsx}'],
    ignores: ['dist/**', 'node_modules/**'],
    plugins: {
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // rules-of-hooks: classic hook-call-site discipline (no hooks
      // inside conditionals, loops, or non-component functions).
      'react-hooks/rules-of-hooks': 'error',
      // exhaustive-deps: defer to React Compiler. The compiler reasons
      // about dependencies more precisely than the lint, and a strict
      // exhaustive-deps surfaces false positives the compiler already
      // resolved correctly.
      'react-hooks/exhaustive-deps': 'off',
      // Surface all four react-compiler bailout severities. `Todo` is
      // load-bearing: the compiler tags components it can't memoize
      // (try/catch value blocks, certain async patterns) as Todo and
      // skips them. Without this we'd silently drop memoization on
      // real components. Set is required; the plugin checks
      // `instanceof Set` and falls back to defaults for any other shape.
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
