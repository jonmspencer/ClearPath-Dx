Create a new authenticated page following the established pattern. Ask the user for:
- Route path (e.g., "/scheduling/new")
- Whether it's a list, detail, or form page
- Data sources needed

Follow these patterns:
- **Server component** (`page.tsx`): Fetch data, serialize with `JSON.parse(JSON.stringify(data))`, pass to client component
- **Client component** (`*-client.tsx`): Receives serialized data as props, handles interactivity
- **List pages**: Use DataTable with @tanstack/react-table, server-side pagination via useCallback fetcher
- **Form pages**: Use react-hook-form + zodResolver + FormField + sonner toast
- **Detail pages**: Fetch by ID from params (remember: `params` is a Promise in Next.js 15)

Reference existing pages in `apps/platform/src/app/(authenticated)/` for patterns.
