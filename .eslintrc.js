module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'jsx-quotes': ['error', 'prefer-single'],
  },
}