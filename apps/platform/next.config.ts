import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@clearpath/ui",
    "@clearpath/auth",
    "@clearpath/database",
    "@clearpath/types",
    "@clearpath/rbac",
  ],
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
