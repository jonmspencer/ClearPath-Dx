import { prisma } from "@clearpath/database";
import type { AuditAction } from "@clearpath/types";

interface CreateAuditLogParams {
  actorId: string | null;
  action: AuditAction;
  resource: string;
  resourceId?: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action as any,
        resource: params.resource,
        resourceId: params.resourceId ?? null,
        oldValues: params.oldValues ?? undefined,
        newValues: params.newValues ?? undefined,
        metadata: params.metadata ?? undefined,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      },
    });
  } catch (error) {
    // Audit logging should never block the main operation
    console.error("Failed to create audit log:", error);
  }
}
