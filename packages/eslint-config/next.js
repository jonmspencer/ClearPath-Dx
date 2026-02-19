const react = require("./react");

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  ...react,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      "@next/next": require("@next/eslint-plugin-next"),
    },
    rules: {
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "warn",
    },
  },
];
