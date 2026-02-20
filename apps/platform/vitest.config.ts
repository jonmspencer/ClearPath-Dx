import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@clearpath/rbac": path.resolve(__dirname, "../../packages/rbac/src"),
      "@clearpath/types": path.resolve(__dirname, "../../packages/types/src"),
    },
  },
});
