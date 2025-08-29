module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': 'warn'
  },
  env: {
    browser: true,
    es6: true,
    node: true
  }
}; 