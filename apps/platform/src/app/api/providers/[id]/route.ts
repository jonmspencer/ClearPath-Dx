import { NextRequest } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow, requirePermission, handleApiError,
  successResponse, ApiError,
} from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { updateProviderSchema } from "@/lib/validations/provider";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "PROVIDER:READ");
    const { id } = await params;
    const provider = await prisma.providerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        organization: { select: { id: true, name: true } },
        availability: { orderBy: { dayOfWeek: "asc" } },
        _count: {
          select: {
            casesAsPsych: true,
            casesAsPsychom: true,
            interviews: true,
          },
        },
      },
    });
    if (!provider) throw new ApiError("Provider not found", 404);
    return successResponse(provider);
  } catch (error) { return handleApiError(error); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "PROVIDER:UPDATE");
    const { id } = await params;
    const existing = await prisma.providerProfile.findUnique({ where: { id } });
    if (!existing) throw new ApiError("Provider not found", 404);

    const body = await request.json();
    const data = updateProviderSchema.parse(body);
    const record = await prisma.providerProfile.update({ where: { id }, data });
    await createAuditLog({
      actorId: session.user.id,
      action: "UPDATE",
      resource: "PROVIDER",
      resourceId: id,
      oldValues: { providerType: existing.providerType, isAcceptingCases: existing.isAcceptingCases },
      newValues: data,
    });
    return successResponse(record, "Provider updated");
  } catch (error) { return handleApiError(error); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "PROVIDER:DELETE");
    const { id } = await params;
    const existing = await prisma.providerProfile.findUnique({ where: { id } });
    if (!existing) throw new ApiError("Provider not found", 404);
    await prisma.providerProfile.delete({ where: { id } });
    await createAuditLog({ actorId: session.user.id, action: "DELETE", resource: "PROVIDER", resourceId: id });
    return successResponse(null, "Provider deleted");
  } catch (error) { return handleApiError(error); }
}
