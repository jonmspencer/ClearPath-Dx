import { NextRequest } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow, requirePermission, handleApiError, successResponse,
} from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { updateOrgSettingsSchema } from "@/lib/validations/settings";

export async function GET() {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "SETTINGS:READ");

    const organization = await prisma.organization.findUnique({
      where: { id: session.user.activeOrganizationId },
      select: {
        id: true,
        name: true,
        type: true,
        phone: true,
        fax: true,
        email: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        website: true,
      },
    });

    if (!organization) {
      return successResponse(null);
    }

    return successResponse(organization);
  } catch (error) { return handleApiError(error); }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "SETTINGS:UPDATE");
    const body = await request.json();
    const data = updateOrgSettingsSchema.parse(body);

    const existing = await prisma.organization.findUnique({
      where: { id: session.user.activeOrganizationId },
      select: { name: true, phone: true, fax: true, email: true, address: true, city: true, state: true, zipCode: true, website: true },
    });

    const organization = await prisma.organization.update({
      where: { id: session.user.activeOrganizationId },
      data,
    });

    await createAuditLog({
      actorId: session.user.id,
      action: "UPDATE",
      resource: "ORGANIZATION",
      resourceId: organization.id,
      oldValues: existing as any,
      newValues: data as any,
    });

    return successResponse(organization, "Organization settings updated");
  } catch (error) { return handleApiError(error); }
}
