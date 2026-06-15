import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: { parser: tsParser },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "function",
          format: ["snake_case"],
          filter: { regex: "^[A-Z][a-z]", match: false },
        },
        { selector: "classMethod", format: ["snake_case"] },
        { selector: "class", format: ["PascalCase"] },
        {
          selector: "variable",
          format: ["snake_case", "UPPER_CASE"],
          filter: { regex: "^[A-Z][a-z]", match: false },
        },
        {
          selector: "variable",
          format: ["PascalCase"],
          filter: { regex: "^[A-Z][a-z]", match: true },
        },
      ],
    },
  },
];
