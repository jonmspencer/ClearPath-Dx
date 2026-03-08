Diagnose and fix build errors:

1. Run `pnpm --filter @clearpath/platform run build` to capture errors
2. Read and analyze the error output
3. Fix each error, starting with the root cause (later errors are often cascading)
4. Re-run the build after fixes to verify

Common build issues:
- Prisma engine missing → run `npx prisma generate --schema=../../packages/database/prisma/schema.prisma` from `apps/platform/`
- Type errors in form resolvers → these are pre-existing, check if new or old
- Edge runtime importing Node.js packages → check middleware import chain
