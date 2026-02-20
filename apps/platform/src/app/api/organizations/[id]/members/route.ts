import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow, requirePermission, handleApiError,
  successResponse, ApiError,
} from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { addMemberSchema } from "@/lib/validations/organization";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "ORGANIZATION:READ");
    const { id } = await params;

    const organization = await prisma.organization.findUnique({ where: { id } });
    if (!organization) throw new ApiError("Organization not found", 404);

    const members = await prisma.userOrganization.findMany({
      where: { organizationId: id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { isPrimary: "desc" },
    });
    return successResponse(members);
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "ORGANIZATION:UPDATE");
    const { id } = await params;

    const organization = await prisma.organization.findUnique({ where: { id } });
    if (!organization) throw new ApiError("Organization not found", 404);

    const body = await request.json();
    const data = addMemberSchema.parse(body);

    const member = await prisma.userOrganization.create({
      data: {
        userId: data.userId,
        organizationId: id,
        role: data.role,
        isPrimary: data.isPrimary,
      },
    });

    await createAuditLog({ actorId: session.user.id, action: "CREATE", resource: "ORGANIZATION_MEMBER", resourceId: member.id, newValues: { userId: data.userId, organizationId: id, role: data.role } });
    return successResponse(member, "Member added to organization");
  } catch (error) { return handleApiError(error); }
}
