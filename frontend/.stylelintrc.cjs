module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-idiomatic-order',
  ],
  plugins: [
    'stylelint-use-logical-spec',
    'stylelint-codeguide',
  ],
  rules: {
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    'custom-property-pattern': null,
    'keyframes-name-pattern': null,
    'scss/dollar-variable-pattern': null,
    'scss/at-mixin-pattern': null,
    'liberty/use-logical-spec': 'always',
    'codeguide/indentation': 2,
    'no-descending-specificity': null,
    'function-no-unknown': null,
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': null,
    'scss/load-no-partial-leading-underscore': null,
  },
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html',
    },
  ],
}
