import { NextRequest } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow, requirePermission, handleApiError,
  successResponse, ApiError,
} from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { updateUserSchema } from "@/lib/validations/user";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "USER:READ");
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        image: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        organizationMemberships: {
          include: { organization: { select: { id: true, name: true } } },
        },
        providerProfile: true,
        _count: {
          select: {
            assignedCases: true,
            scheduledCases: true,
            auditLogs: true,
          },
        },
      },
    });
    if (!user) throw new ApiError("User not found", 404);
    return successResponse(user);
  } catch (error) { return handleApiError(error); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "USER:UPDATE");
    const { id } = await params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new ApiError("User not found", 404);

    const body = await request.json();
    const data = updateUserSchema.parse(body);

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isActive: true,
        updatedAt: true,
      },
    });
    await createAuditLog({ actorId: session.user.id, action: "UPDATE", resource: "USER", resourceId: id, oldValues: { email: existing.email, name: existing.name, isActive: existing.isActive }, newValues: data });
    return successResponse(user, "User updated");
  } catch (error) { return handleApiError(error); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "USER:DELETE");
    const { id } = await params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new ApiError("User not found", 404);

    await prisma.user.update({ where: { id }, data: { isActive: false } });
    await createAuditLog({ actorId: session.user.id, action: "DELETE", resource: "USER", resourceId: id });
    return successResponse(null, "User deactivated");
  } catch (error) { return handleApiError(error); }
}
