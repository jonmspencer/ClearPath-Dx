import { NextRequest } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow, requirePermission, handleApiError,
  successResponse, ApiError,
} from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { updateOrganizationSchema } from "@/lib/validations/organization";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "ORGANIZATION:READ");
    const { id } = await params;
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        accountManager: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { isPrimary: "desc" },
        },
        referralSources: { select: { id: true, label: true, isActive: true } },
        _count: { select: { referrals: true, clients: true, billingRecords: true } },
      },
    });
    if (!organization) throw new ApiError("Organization not found", 404);
    return successResponse(organization);
  } catch (error) { return handleApiError(error); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "ORGANIZATION:UPDATE");
    const { id } = await params;
    const existing = await prisma.organization.findUnique({ where: { id } });
    if (!existing) throw new ApiError("Organization not found", 404);

    const body = await request.json();
    const data = updateOrganizationSchema.parse(body);

    const organization = await prisma.organization.update({ where: { id }, data });
    await createAuditLog({ actorId: session.user.id, action: "UPDATE", resource: "ORGANIZATION", resourceId: id, oldValues: { name: existing.name, type: existing.type }, newValues: data });
    return successResponse(organization, "Organization updated");
  } catch (error) { return handleApiError(error); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "ORGANIZATION:DELETE");
    const { id } = await params;
    const existing = await prisma.organization.findUnique({ where: { id } });
    if (!existing) throw new ApiError("Organization not found", 404);
    await prisma.organization.delete({ where: { id } });
    await createAuditLog({ actorId: session.user.id, action: "DELETE", resource: "ORGANIZATION", resourceId: id });
    return successResponse(null, "Organization deleted");
  } catch (error) { return handleApiError(error); }
}
