Reset and reseed the local development database:

1. Confirm the DATABASE_URL in `.env` points to localhost (NOT production)
2. Run `pnpm --filter @clearpath/database run db:push --force-reset` to reset schema
3. Run `pnpm --filter @clearpath/database run db:seed` to seed data
4. Report the seeded accounts

NEVER run this against a production DATABASE_URL.
