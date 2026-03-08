import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Find where @prisma/client's .prisma/client directory is
const prismaClientDir = path.dirname(require.resolve("@prisma/client"));
const generatedDir = path.join(prismaClientDir, "../../.prisma/client");

try {
  const files = fs.readdirSync(generatedDir);
  const engines = files.filter((f) => f.includes("libquery_engine"));

  if (engines.length === 0) {
    console.log("[copy-prisma-engine] No engine binaries found, skipping.");
    process.exit(0);
  }

  // Copy to .prisma/client relative to the platform app (Vercel searches here)
  const destDir = path.join(process.cwd(), ".prisma", "client");
  fs.mkdirSync(destDir, { recursive: true });

  for (const engine of engines) {
    const src = path.join(generatedDir, engine);
    const dest = path.join(destDir, engine);
    fs.copyFileSync(src, dest);
    console.log(`[copy-prisma-engine] Copied ${engine} to .prisma/client/`);
  }
} catch (err) {
  console.error("[copy-prisma-engine] Warning:", err.message);
  // Don't fail the build - engine might already be in the right place
}
