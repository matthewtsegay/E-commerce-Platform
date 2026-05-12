import { defineConfig } from "eslint/config";
import nextPlugin from "@next/eslint-plugin-next";
import nextConfig from "eslint-config-next";

export default defineConfig([
    {
        plugins: {
            "next": nextPlugin,
        },
    },
    ...nextConfig,
    {
        rules: {
            "react-hooks/set-state-in-effect": "off",
            "@next/next/no-img-element": "off",
        },
    },
]);
