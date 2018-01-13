// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    jquery: true
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  globals: {
    moment: true,
    Dropzone: true
  },
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'space-before-function-paren': 0,
    'no-unused-vars': 1,
    'comma-dangle': 1,
    'eol-last': 0,
    'spaced-comment': 1,
    'keyword-spacing': 0,
    'space-in-parens': 1,
    'eqeqeq': 1,
    'indent': 0,
    'semi': [1, "always"],
    'func-call-spacing': 0,
    'no-unexpected-multiline': 0,
    'no-useless-escape': 0,
    'one-var': 0,
    'no-unused-expressions': 0
  }
}
