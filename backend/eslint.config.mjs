import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import js from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: globals.node } },
    {rules: {    ...js.configs.recommended.rules,"no-explicit-any": "warn" } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
];
