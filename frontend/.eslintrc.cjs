module.exports = {
  plugins: [
    'regex',
    'local-rules',
  ],
  extends: [
    '@antfu/eslint-config-vue',
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        'local-rules/valid-appcardcode-code-prop': 'error',
        'local-rules/valid-appcardcode-demo-sfc': 'error',
      },
    },
  ],
}
