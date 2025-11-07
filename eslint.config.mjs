import { defineConfig } from "eslint/config";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import ts from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:prettier/recommended"
    ),

    languageOptions: {
        parser,
        parserOptions: {
            project: path.resolve(__dirname, "./tsconfig.json"),
            tsconfigRootDir: __dirname,
            ecmaVersion: 2020,
            sourceType: "module",
        },

        globals: {
            ...globals.browser,
        },
    },

    plugins: {
        "@typescript-eslint": ts,
    },

    //TODO: There is no strong support for Amplenote Plugin development in typescript yet.
    rules: {
        "@typescript-eslint/no-explicit-any": "off",

        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-argument": "off",

        "@typescript-eslint/no-unused-vars": [
            "warn",
            { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
        ],
    },
}]);