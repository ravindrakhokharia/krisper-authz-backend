const typescriptEslint = require('typescript-eslint');
const prettierPlugin = require('eslint-plugin-prettier');
const eslintConfigPrettier = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
  ...typescriptEslint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      parser: typescriptEslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'prettier/prettier': 'error',
    },
  },
  {
    ignores: [
      '.eslintrc.js',
      'eslint.config.js',
      'dist/**',
      'node_modules/**',
      'coverage/**',
    ],
  },
];
