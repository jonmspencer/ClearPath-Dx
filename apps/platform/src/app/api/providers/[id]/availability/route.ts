import { NextRequest } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow, requirePermission, handleApiError,
  successResponse, ApiError,
} from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { createAvailabilitySchema } from "@/lib/validations/provider";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "PROVIDER_AVAILABILITY:READ");
    const { id } = await params;

    const provider = await prisma.providerProfile.findUnique({ where: { id } });
    if (!provider) throw new ApiError("Provider not found", 404);

    const availability = await prisma.providerAvailability.findMany({
      where: { providerId: id },
      orderBy: { dayOfWeek: "asc" },
    });

    return successResponse(availability);
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "PROVIDER_AVAILABILITY:CREATE");
    const { id } = await params;

    const provider = await prisma.providerProfile.findUnique({ where: { id } });
    if (!provider) throw new ApiError("Provider not found", 404);

    const body = await request.json();
    const data = createAvailabilitySchema.parse(body);

    const slot = await prisma.providerAvailability.create({
      data: {
        providerId: id,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isRecurring: data.isRecurring,
        specificDate: data.specificDate ? new Date(data.specificDate) : null,
      },
    });

    await createAuditLog({
      actorId: session.user.id,
      action: "CREATE",
      resource: "PROVIDER_AVAILABILITY",
      resourceId: slot.id,
      newValues: { providerId: id, dayOfWeek: data.dayOfWeek, startTime: data.startTime, endTime: data.endTime },
    });

    return successResponse(slot, "Availability slot created");
  } catch (error) { return handleApiError(error); }
}
