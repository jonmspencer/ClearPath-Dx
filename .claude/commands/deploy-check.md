Run a full pre-deployment check:

1. Run `pnpm --filter @clearpath/platform run build` and verify it passes with 0 errors
2. Check `git status` for any uncommitted changes
3. If build passes and there are uncommitted changes, summarize what would be deployed
4. If build fails, show the errors and suggest fixes

Do NOT push or deploy — just verify readiness.
