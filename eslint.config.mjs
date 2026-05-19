import globals from 'globals'
import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import stylisticJS from '@stylistic/eslint-plugin'
import { plugin } from 'mongoose'

export default defineConfig([
  js.configs.recommended,
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { files: ['**/*.{js,mjs,cjs}'], languageOptions: { globals: globals.browser } },
  { plugins: {'@stylistic/js': stylisticJS} },
  { rules: {
    '@stylistic/js/indent': ['error', 2],
    '@stylistic/js/linebreak-style': ['error', 'unix'],
    '@stylistic/js/quotes': ['error', 'single'],
    '@stylistic/js/semi': ['error', 'never'],
    eqeqeq: 'error'
  }},
  { ignores: ['dist/**'] }
])
