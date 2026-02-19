import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@clearpath/ui",
    "@clearpath/auth",
    "@clearpath/database",
    "@clearpath/types",
    "@clearpath/rbac",
  ],
};

export default nextConfig;
