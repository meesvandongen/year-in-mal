import { defineConfig, lazyPlugins } from "vite-plus";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  // The code is not formatter-managed; these options mirror the existing style.
  fmt: { semi: true, singleQuote: false, printWidth: 80 },
  lint: {
    ignorePatterns: ["dist/**"],
    plugins: ["typescript", "oxc", "unicorn", "react"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      // Carried over from the previous ESLint config (react-hooks/recommended).
      "react/rules-of-hooks": "error",
      "react/exhaustive-deps": "warn",
    },
    // Type errors are reported by `tsc` (TypeScript 5) in the build script; the
    // linter's bundled TypeScript 7 flags the `swiper/css` side-effect imports.
    options: { typeAware: true },
  },
  plugins: lazyPlugins(() => [react()]),
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8788",
        changeOrigin: false,
      },
    },
  },
});
