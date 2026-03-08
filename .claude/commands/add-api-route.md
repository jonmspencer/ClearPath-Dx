Create a new API route following the established pattern. Ask the user for:
- Resource name (e.g., "providers", "reports")
- HTTP methods needed (GET, POST, PUT, DELETE)
- Required permissions

Then implement using this pattern:
```typescript
import { NextRequest } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow,
  requirePermission,
  successResponse,
  handleApiError,
  createAuditLog,
} from "@/lib/api-helpers";
```

Follow the existing routes in `apps/platform/src/app/api/` for reference. Always include:
- Session check via `getSessionOrThrow()`
- Permission check via `requirePermission()`
- Zod validation for POST/PUT bodies
- Audit logging for mutations
- Error handling via `handleApiError()`
