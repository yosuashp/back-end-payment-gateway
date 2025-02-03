import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,  
        ...globals.browser,
      },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "*.min.js",
      "package.json",
      "package-lock.json",
      "eslint.config.mjs",
      "app/views/js/script.js"
    ],
  },
];
