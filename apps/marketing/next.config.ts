import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@clearpath/ui"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
