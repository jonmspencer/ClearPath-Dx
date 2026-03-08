import { NextRequest } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow,
  requirePermission,
  handleApiError,
  successResponse,
  ApiError,
} from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { updateAvailabilitySchema } from "@/lib/validations/scheduling";
import { getProviderProfileId, isSelfScoped } from "@/lib/data-scoping";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "PROVIDER_AVAILABILITY:UPDATE");

    const { id } = await params;
    const body = await request.json();
    const data = updateAvailabilitySchema.parse(body);

    const existing = await prisma.providerAvailability.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Availability record not found", 404);
    }

    // Self-scoped providers can only update their own availability
    if (isSelfScoped((session.user as any).activeRole as any)) {
      const providerProfileId = await getProviderProfileId(session.user.id);
      if (!providerProfileId || existing.providerId !== providerProfileId) {
        throw new ApiError("Forbidden", 403);
      }
    }

    const availability = await prisma.providerAvailability.update({
      where: { id },
      data: data as any,
      include: {
        provider: {
          select: {
            id: true,
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    await createAuditLog({
      actorId: session.user.id,
      action: "UPDATE",
      resource: "PROVIDER_AVAILABILITY",
      resourceId: id,
      oldValues: {
        dayOfWeek: existing.dayOfWeek,
        startTime: existing.startTime,
        endTime: existing.endTime,
      },
      newValues: data,
    });

    return successResponse(availability, "Availability updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "PROVIDER_AVAILABILITY:UPDATE");

    const { id } = await params;

    const existing = await prisma.providerAvailability.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Availability record not found", 404);
    }

    // Self-scoped providers can only delete their own availability
    if (isSelfScoped((session.user as any).activeRole as any)) {
      const providerProfileId = await getProviderProfileId(session.user.id);
      if (!providerProfileId || existing.providerId !== providerProfileId) {
        throw new ApiError("Forbidden", 403);
      }
    }

    await prisma.providerAvailability.delete({ where: { id } });

    await createAuditLog({
      actorId: session.user.id,
      action: "DELETE",
      resource: "PROVIDER_AVAILABILITY",
      resourceId: id,
      oldValues: {
        providerId: existing.providerId,
        dayOfWeek: existing.dayOfWeek,
      },
    });

    return successResponse(null, "Availability deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
