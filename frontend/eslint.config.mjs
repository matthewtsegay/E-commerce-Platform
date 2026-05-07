import { defineConfig } from "eslint/config";

export default defineConfig({
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
        "react-hooks/set-state-in-effect": "off",
        "@next/next/no-img-element": "off",
    },
});
