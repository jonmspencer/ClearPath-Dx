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
import { getProviderProfileId, isSelfScoped } from "@/lib/data-scoping";

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

    // Scope to provider's own availability for self-scoped roles
    if (isSelfScoped((session.user as any).activeRole as any)) {
      const providerProfileId = await getProviderProfileId(session.user.id);
      if (providerProfileId) {
        where.providerId = providerProfileId;
      }
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

    // Self-scoped providers can only create their own availability
    let effectiveProviderId = data.providerId;
    if (isSelfScoped((session.user as any).activeRole as any)) {
      const providerProfileId = await getProviderProfileId(session.user.id);
      if (!providerProfileId) {
        return NextResponse.json({ success: false, error: "No provider profile found" }, { status: 400 });
      }
      effectiveProviderId = providerProfileId;
    }

    const availability = await prisma.providerAvailability.create({
      data: {
        providerId: effectiveProviderId,
        dayOfWeek: data.dayOfWeek as any,
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
      newValues: { providerId: effectiveProviderId, dayOfWeek: data.dayOfWeek },
    });

    return successResponse(availability, "Availability created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
