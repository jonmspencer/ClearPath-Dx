import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow,
  requirePermission,
  buildPaginationParams,
  buildPaginatedResponse,
  handleApiError,
  successResponse,
} from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { createAvailabilitySchema } from "@/lib/validations/scheduling";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "PROVIDER_AVAILABILITY:LIST");

    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = buildPaginationParams(searchParams);

    const providerId = searchParams.get("providerId");
    const dayOfWeek = searchParams.get("dayOfWeek");

    const where: any = {};
    if (providerId) where.providerId = providerId;
    if (dayOfWeek !== null && dayOfWeek !== undefined && dayOfWeek !== "") {
      where.dayOfWeek = parseInt(dayOfWeek);
    }

    const [data, total] = await Promise.all([
      prisma.providerAvailability.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        include: {
          provider: {
            select: {
              id: true,
              user: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.providerAvailability.count({ where }),
    ]);

    return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "PROVIDER_AVAILABILITY:CREATE");

    const body = await request.json();
    const data = createAvailabilitySchema.parse(body);

    const availability = await prisma.providerAvailability.create({
      data: {
        providerId: data.providerId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isRecurring: data.isRecurring,
        specificDate: data.specificDate || null,
      },
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
      action: "CREATE",
      resource: "PROVIDER_AVAILABILITY",
      resourceId: availability.id,
      newValues: { providerId: data.providerId, dayOfWeek: data.dayOfWeek },
    });

    return successResponse(availability, "Availability created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
