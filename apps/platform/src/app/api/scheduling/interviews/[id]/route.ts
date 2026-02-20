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
import { updateInterviewSchema } from "@/lib/validations/scheduling";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "INTERVIEW:READ");

    const { id } = await params;

    const interview = await prisma.interviewEvent.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            client: { select: { id: true, firstName: true, lastName: true } },
            referral: { select: { id: true, referralNumber: true } },
          },
        },
        provider: {
          select: {
            id: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!interview) {
      throw new ApiError("Interview not found", 404);
    }

    return successResponse(interview);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "INTERVIEW:UPDATE");

    const { id } = await params;
    const body = await request.json();
    const data = updateInterviewSchema.parse(body);

    const existing = await prisma.interviewEvent.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Interview not found", 404);
    }

    const updateData: any = { ...data };
    // Handle empty meetingLink
    if (data.meetingLink === "") updateData.meetingLink = null;

    const interview = await prisma.interviewEvent.update({
      where: { id },
      data: updateData,
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
      action: "UPDATE",
      resource: "INTERVIEW",
      resourceId: id,
      oldValues: {
        scheduledStart: existing.scheduledStart,
        isCompleted: existing.isCompleted,
        isCancelled: existing.isCancelled,
      },
      newValues: data,
    });

    return successResponse(interview, "Interview updated successfully");
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
    requirePermission(session, "INTERVIEW:DELETE");

    const { id } = await params;

    const existing = await prisma.interviewEvent.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Interview not found", 404);
    }

    await prisma.interviewEvent.delete({ where: { id } });

    await createAuditLog({
      actorId: session.user.id,
      action: "DELETE",
      resource: "INTERVIEW",
      resourceId: id,
      oldValues: {
        caseId: existing.caseId,
        interviewType: existing.interviewType,
        scheduledStart: existing.scheduledStart,
      },
    });

    return successResponse(null, "Interview deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
