module.exports = {
  // root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
    commonjs: true,
  },
  extends: ["eslint:recommended", "plugin:vue/base"],
  parserOptions: {
    parser: "babel-eslint",
  },
  rules: {
    // "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-console": "warn",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    // "no-unused-vars": "off",
    "no-useless-escape": "off",
  },
};