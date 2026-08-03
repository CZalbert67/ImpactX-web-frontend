import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  define: {
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
      "https://api.test.invalid",
    ),
    "import.meta.env.VITE_API_CONTRACT_VERSION": JSON.stringify("2026.08.05"),
  },
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost:3000/",
      },
    },
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/main.tsx",
        "src/api/generated/**",
        "src/test/**",
        "src/vite-env.d.ts",
      ],
    },
  },
});