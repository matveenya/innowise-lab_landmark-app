import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import prettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], 
    plugins: { js }, 
    extends: ["js/recommended"], 
    languageOptions: { 
      globals: globals.browser 
    } 
  },
  tseslint.configs.recommended,
  pluginVue.configs["flat/essential"],
  { 
    files: ["**/*.vue"], 
    languageOptions: { 
      parserOptions: { 
        parser: tseslint.parser 
      } 
    } 
  },
  prettier,
  {
    plugins: {
      prettier: pluginPrettier
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
      'vue/multi-word-component-names': 'off'
    }
  }
]);
