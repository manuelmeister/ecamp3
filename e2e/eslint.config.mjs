import { includeIgnoreFile } from '@eslint/compat'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import playwrightEslint from 'eslint-plugin-playwright'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const gitignorePath = path.resolve(__dirname, '.gitignore')

export default [
  js.configs.recommended,
  playwrightEslint.configs['flat/recommended'],
  prettierRecommended,
  {
    ignores: ['data/', 'playwright-report/', 'test-results/'],
  },

  includeIgnoreFile(gitignorePath),

  {
    languageOptions: {
      globals: {
        ...globals.node,
      },

      ecmaVersion: 2022,

      parserOptions: {
        parser: '@babel/eslint-parser',
      },
    },

    rules: {
      'prefer-const': 'error',
      'prettier/prettier': 'error',
    },
  },
]
