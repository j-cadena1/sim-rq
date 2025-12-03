const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const importPlugin = require('eslint-plugin-import');
const promisePlugin = require('eslint-plugin-promise');

module.exports = [
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      promise: promisePlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },
];
