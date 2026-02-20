import { NextRequest } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow, requirePermission, handleApiError,
  successResponse, ApiError,
} from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { assignRoleSchema } from "@/lib/validations/user";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "USER:READ");
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new ApiError("User not found", 404);

    const memberships = await prisma.userOrganization.findMany({
      where: { userId: id },
      include: { organization: { select: { id: true, name: true } } },
    });
    return successResponse(memberships);
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "USER:UPDATE");
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new ApiError("User not found", 404);

    const body = await request.json();
    const data = assignRoleSchema.parse(body);

    if (data.isPrimary) {
      await prisma.userOrganization.updateMany({
        where: { userId: id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const membership = await prisma.userOrganization.create({
      data: {
        userId: id,
        organizationId: data.organizationId,
        role: data.role as any,
        isPrimary: data.isPrimary ?? false,
      },
      include: { organization: { select: { id: true, name: true } } },
    });

    await createAuditLog({ actorId: session.user.id, action: "UPDATE", resource: "USER", resourceId: id, newValues: { role: data.role, organizationId: data.organizationId } });
    return successResponse(membership, "Role assigned");
  } catch (error) { return handleApiError(error); }
}
