import stylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint'

export default [
  stylistic.configs['recommended-flat'],
  {
    plugins: {
      '@stylistic': stylistic,
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: 'tsconfig.json',
      },
    },
    files: ['src/**/*.ts'],
    rules: {
      '@/no-unused-vars': 'off',
      '@stylistic/arrow-parens': 'off',
      '@stylistic/brace-style': 'off',
      '@stylistic/space-before-function-paren': 'off',
      '@stylistic/comma-dangle': 'off',
      '@stylistic/indent': ['error', 4],
      '@stylistic/quotes': ['error', 'single'],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
