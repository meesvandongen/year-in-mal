import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins } from "vite-plus";

export default defineConfig({
  fmt: {
    ignorePatterns: ["dist/**", "src/demo/catalog.json", "pnpm-lock.yaml"],
  },
  lint: {
    ignorePatterns: ["dist/**"],
    plugins: ["typescript", "oxc", "unicorn", "react"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      "react/rules-of-hooks": "error",
      "react/exhaustive-deps": "warn",
    },
    options: { typeAware: true, typeCheck: true },
  },
  test: {
    include: ["src/**/*.test.ts", "functions/**/*.test.ts"],
  },
  plugins: lazyPlugins(() => [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()]),
  server: {
    proxy: {
      // `pnpm run dev:functions` serves the Cloudflare Pages functions.
      "/api": { target: "http://localhost:8788", changeOrigin: false },
    },
  },
});
