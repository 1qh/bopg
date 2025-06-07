/// <reference types="./types.d.ts" />

import * as path from 'node:path'
import { includeIgnoreFile } from '@eslint/compat'
import eslint from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import perfectionist from 'eslint-plugin-perfectionist'
import preferArrow from 'eslint-plugin-prefer-arrow-functions'
import turboPlugin from 'eslint-plugin-turbo'
import tseslint from 'typescript-eslint'

export const restrictEnvAccess = tseslint.config(
  { ignores: ['**/env.ts'] },
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          importNames: ['env'],
          message: "Use `import { env } from '~/env'` instead to ensure validated types.",
          name: 'process'
        }
      ],
      'no-restricted-properties': [
        'error',
        {
          message: "Use `import { env } from '~/env'` instead to ensure validated types.",
          object: 'process',
          property: 'env'
        }
      ]
    }
  }
)

export default tseslint.config(
  includeIgnoreFile(path.join(import.meta.dirname, '../../.gitignore')),
  perfectionist.configs['recommended-natural'],
  { ignores: ['**/*.config.*'] },
  {
    extends: [
      eslint.configs.recommended,
      eslint.configs.all,
      ...tseslint.configs.all,
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked
    ],
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    plugins: {
      import: importPlugin,
      preferArrow,
      turbo: turboPlugin
    },
    rules: {
      ...turboPlugin.configs.recommended.rules,
      '@typescript-eslint/consistent-return': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { fixStyle: 'separate-type-imports', prefer: 'type-imports' }
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/init-declarations': 'off',
      '@typescript-eslint/naming-convention': [
        'warn',
        { format: ['camelCase', 'UPPER_CASE', 'PascalCase'], selector: 'variable' }
      ],
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-magic-numbers': ['warn', { ignore: [-1, 0, 1, 100] }],
      '@typescript-eslint/no-misused-promises': [2, { checksVoidReturn: { attributes: false } }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unnecessary-condition': ['error', { allowConstantLoopConditions: true }],
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      camelcase: 'off',
      curly: ['error', 'multi'],
      'id-length': 'off',
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'new-cap': ['error', { capIsNewExceptions: ['NextAuth', 'DrizzleAdapter'] }],
      'no-console': 'warn',
      'no-duplicate-imports': 'off',
      'no-nested-ternary': 'off',
      'no-promise-executor-return': 'off',
      'no-ternary': 'off',
      'no-undefined': 'off',
      'no-underscore-dangle': 'off',
      'one-var': ['warn', 'consecutive'],
      'perfectionist/sort-variable-declarations': 'off',
      'preferArrow/prefer-arrow-functions': ['error', { returnStyle: 'implicit' }],
      'sort-imports': 'off',
      'sort-keys': 'off',
      'sort-vars': ['off', { ignoreCase: true }]
    }
  },
  {
    languageOptions: { parserOptions: { projectService: true } },
    linterOptions: { reportUnusedDisableDirectives: true }
  }
)
