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

/**
 * GET — Care coordinator task queue.
 * Returns referrals in early pipeline stages with outreach history,
 * ordered by priority and time since last contact attempt.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "REFERRAL:LIST");

    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = buildPaginationParams(searchParams);
    const statusFilter = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {
      status: statusFilter
        ? statusFilter
        : { in: ["RECEIVED", "INTAKE_IN_PROGRESS", "PARENT_CONTACTED"] },
    };

    if (search) {
      where.OR = [
        { referralNumber: { contains: search, mode: "insensitive" } },
        { childFirstName: { contains: search, mode: "insensitive" } },
        { childLastName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.referral.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ priority: "desc" }, { receivedAt: "asc" }],
        include: {
          referringOrg: { select: { id: true, name: true } },
          client: {
            include: {
              guardians: {
                where: { isPrimary: true },
                take: 1,
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                  email: true,
                },
              },
            },
          },
          outreachLogs: {
            orderBy: { sentAt: "desc" },
            take: 5,
            select: {
              id: true,
              channel: true,
              status: true,
              sentAt: true,
              respondedAt: true,
              response: true,
              attemptNumber: true,
            },
          },
          diagnosticCase: {
            select: {
              id: true,
              caseNumber: true,
              coordinator: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.referral.count({ where }),
    ]);

    return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST — Log a coordinator action (call note, status advance, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "REFERRAL:UPDATE");

    const body = await request.json();
    const { referralId, action, note } = body;

    if (!referralId || !action) {
      return NextResponse.json(
        { error: "referralId and action are required" },
        { status: 400 }
      );
    }

    const referral = await prisma.referral.findUnique({ where: { id: referralId } });
    if (!referral) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    if (action === "LOG_CALL") {
      // Log a phone call attempt
      await prisma.outreachLog.create({
        data: {
          referralId,
          channel: "PHONE_CALL",
          status: note ? "RESPONDED" : "SENT",
          message: note || "Phone call attempted",
          response: note || null,
          respondedAt: note ? new Date() : null,
          attemptNumber: 1,
        },
      });

      await createAuditLog({
        actorId: session.user.id,
        action: "CREATE",
        resource: "OUTREACH",
        resourceId: referralId,
        newValues: { type: "PHONE_CALL", note },
      });

      return successResponse({ logged: true }, "Call logged successfully");
    }

    if (action === "ADVANCE_STATUS") {
      const statusProgression: Record<string, string> = {
        RECEIVED: "INTAKE_IN_PROGRESS",
        INTAKE_IN_PROGRESS: "PARENT_CONTACTED",
        PARENT_CONTACTED: "READY_TO_SCHEDULE",
      };

      const nextStatus = statusProgression[referral.status];
      if (!nextStatus) {
        return NextResponse.json(
          { error: `Cannot advance from status: ${referral.status}` },
          { status: 400 }
        );
      }

      const updateData: any = { status: nextStatus };
      if (nextStatus === "INTAKE_IN_PROGRESS") updateData.intakeStartedAt = new Date();
      if (nextStatus === "PARENT_CONTACTED") updateData.parentContactedAt = new Date();

      const updated = await prisma.referral.update({
        where: { id: referralId },
        data: updateData,
      });

      await prisma.referralStatusHistory.create({
        data: {
          referralId,
          fromStatus: referral.status,
          toStatus: nextStatus as any,
          changedBy: session.user.id,
          note: note || "Advanced by coordinator",
        },
      });

      await createAuditLog({
        actorId: session.user.id,
        action: "UPDATE",
        resource: "REFERRAL",
        resourceId: referralId,
        oldValues: { status: referral.status },
        newValues: { status: nextStatus },
      });

      return successResponse(updated, `Status advanced to ${nextStatus}`);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
}
