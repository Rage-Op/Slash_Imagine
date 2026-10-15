module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Disabled: This project uses JSDoc / runtime checks for props instead of PropTypes.
    // PropTypes add runtime overhead and are considered legacy in favor of TypeScript.
    'react/prop-types': 'off',
    // Warn on unused vars but allow underscore-prefixed names for intentionally unused vars
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    // Allow custom attributes used by UI libraries (cmdk, radix, etc.)
    'react/no-unknown-property': ['error', { ignore: ['cmdk-input-wrapper'] }],
  },
}
