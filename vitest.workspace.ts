import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    extends: "./packages/rbac/vitest.config.ts",
    test: {
      name: "rbac",
      root: "./packages/rbac",
    },
  },
  {
    extends: "./apps/platform/vitest.config.ts",
    test: {
      name: "platform",
      root: "./apps/platform",
    },
  },
]);
