const path = require('path')

module.exports = {
  root: true,
  env: {
    browser: true,
  },
  extends: [
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:sonarjs/recommended',
    'plugin:storybook/recommended',
  ],
  plugins: ['@typescript-eslint', 'react-refresh'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    // project: path.join(__dirname, './tsconfig.json'),
    project: path.join(__dirname, './src/webviews/tsconfig.json'),
    createDefaultProgram: true,
  },

  overrides: [
    {
      files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.ts'],
      env: {
        jest: true,
      },
    },
  ],
  ignorePatterns: ['dist'],

  rules: {
    radix: 'off',
    semi: ['error', 'never'],
    'no-bitwise': ['error', { allow: ['|'] }],
    'max-len': [
      'error',
      {
        ignoreComments: true,
        ignoreStrings: true,
        ignoreRegExpLiterals: true,
        code: 120,
      },
    ],
    'class-methods-use-this': 'off',
    // https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react#consistent-components-exports
    // 'react-refresh/only-export-components': ['warn'],
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'import/no-cycle': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-named-as-default': 'off',
    'no-unexpected-multiline': 'error',
    'no-plusplus': 'off',
    'no-return-await': 'off',
    'no-underscore-dangle': 'off',
    'no-useless-catch': 'off',
    'no-console': ['error', { allow: ['warn', 'error', 'debug'] }],
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/no-access-key': 'off',
    'max-classes-per-file': 'off',
    'no-case-declarations': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
    'react/prop-types': 1,
    'react/jsx-one-expression-per-line': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/semi': ['error', 'never'],
    '@typescript-eslint/no-use-before-define': 'off',
    'implicit-arrow-linebreak': 'off',
    'object-curly-newline': 'off',
    'no-nested-ternary': 'off',
    'no-param-reassign': ['error', { props: false }],
    'sonarjs/no-duplicate-string': 'off',
    'sonarjs/cognitive-complexity': [1, 20],
    'sonarjs/no-identical-functions': [0, 5],
    'import/order': [
      1,
      {
        groups: [
          'external',
          'builtin',
          'internal',
          'sibling',
          'parent',
          'index',
        ],
        pathGroups: [
          {
            pattern: 'uiSrc/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'testSrc/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'apiSrc/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '{.,..}/*.scss', // same directory only
            // pattern: '{.,..}/**/*\.scss' // same & outside directories (e.g. import '../foo/foo.scss')
            group: 'object',
            position: 'after',
          },
        ],
        warnOnUnassignedImports: true,
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
  },
}
