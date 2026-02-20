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
import { createInterviewSchema } from "@/lib/validations/scheduling";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "INTERVIEW:LIST");

    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = buildPaginationParams(searchParams);

    const caseId = searchParams.get("caseId");
    const providerId = searchParams.get("providerId");
    const interviewType = searchParams.get("interviewType");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const status = searchParams.get("status");

    const where: any = {};
    if (caseId) where.caseId = caseId;
    if (providerId) where.providerId = providerId;
    if (interviewType) where.interviewType = interviewType;
    if (fromDate || toDate) {
      where.scheduledStart = {};
      if (fromDate) where.scheduledStart.gte = new Date(fromDate);
      if (toDate) where.scheduledStart.lte = new Date(toDate);
    }
    if (status === "completed") where.isCompleted = true;
    if (status === "cancelled") where.isCancelled = true;
    if (status === "upcoming") {
      where.isCompleted = false;
      where.isCancelled = false;
      where.scheduledStart = { gte: new Date() };
    }

    const [data, total] = await Promise.all([
      prisma.interviewEvent.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { scheduledStart: "asc" },
        include: {
          case: {
            select: {
              id: true,
              caseNumber: true,
              client: { select: { id: true, firstName: true, lastName: true } },
            },
          },
          provider: {
            select: {
              id: true,
              user: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.interviewEvent.count({ where }),
    ]);

    return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "INTERVIEW:CREATE");

    const body = await request.json();
    const data = createInterviewSchema.parse(body);

    const interview = await prisma.interviewEvent.create({
      data: {
        caseId: data.caseId,
        providerId: data.providerId,
        interviewType: data.interviewType,
        scheduledStart: data.scheduledStart,
        scheduledEnd: data.scheduledEnd,
        location: data.location || null,
        meetingLink: data.meetingLink || null,
        notes: data.notes || null,
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            client: { select: { id: true, firstName: true, lastName: true } },
          },
        },
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
      resource: "INTERVIEW",
      resourceId: interview.id,
      newValues: {
        caseId: data.caseId,
        interviewType: data.interviewType,
        scheduledStart: data.scheduledStart,
      },
    });

    return successResponse(interview, "Interview scheduled successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
