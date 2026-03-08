When modifying the Prisma schema:
- After changes, run `npx prisma generate` to regenerate the client
- For production, also run migrations: `npx prisma migrate dev --name <description>`
- Keep `binaryTargets = ["native", "rhel-openssl-3.0.x"]` for Vercel compatibility
- The `.env` symlink from root to `packages/database/.env` is required for Prisma CLI
- After schema changes that affect seed data, update `packages/database/prisma/seed.ts`
