/* eslint-env node */
module.exports = {
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
        "prettier",
    ],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
    },
    root: true,
    rules: {
        "no-console": "error",
        "dot-notation": "error",
        "@typescript-eslint/require-await": "off",
        "@typescript-eslint/unbound-method": "off",
        "eslint@typescript-eslint/no-misused-promises": "off",
        "@typescript-eslint/no-misused-promises": "off",
        "@typescript-eslint/ban-ts-comment": "off",
    },
};
