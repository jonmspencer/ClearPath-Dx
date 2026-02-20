import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow,
  requirePermission,
  handleApiError,
  successResponse,
  ApiError,
} from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { updateReportSchema } from "@/lib/validations/report";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "REPORT:READ");
    const { id } = await params;

    const report = await prisma.diagnosticReport.findUnique({
      where: { id },
      include: {
        diagnosticCase: {
          select: {
            id: true, caseNumber: true,
            client: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        author: { select: { id: true, user: { select: { name: true, email: true } } } },
        reviewQueue: {
          orderBy: { assignedAt: "desc" },
          include: { reviewer: { select: { user: { select: { name: true } } } } },
        },
      },
    });

    if (!report) throw new ApiError("Report not found", 404);
    return successResponse(report);
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
    requirePermission(session, "REPORT:UPDATE");
    const { id } = await params;

    const existing = await prisma.diagnosticReport.findUnique({ where: { id } });
    if (!existing) throw new ApiError("Report not found", 404);

    const body = await request.json();
    const data = updateReportSchema.parse(body);

    const updateData: any = { ...data };
    if (data.status === "IN_REVIEW" && !existing.submittedAt) {
      updateData.submittedAt = new Date();
    }
    if (data.status === "APPROVED" && !existing.approvedAt) {
      updateData.approvedAt = new Date();
    }
    if (data.status === "DELIVERED" && !existing.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    const report = await prisma.diagnosticReport.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      actorId: session.user.id,
      action: "UPDATE",
      resource: "REPORT",
      resourceId: id,
      oldValues: { status: existing.status },
      newValues: data,
    });

    return successResponse(report, "Report updated");
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
    requirePermission(session, "REPORT:DELETE");
    const { id } = await params;

    const existing = await prisma.diagnosticReport.findUnique({ where: { id } });
    if (!existing) throw new ApiError("Report not found", 404);

    await prisma.diagnosticReport.delete({ where: { id } });

    await createAuditLog({
      actorId: session.user.id,
      action: "DELETE",
      resource: "REPORT",
      resourceId: id,
    });

    return successResponse(null, "Report deleted");
  } catch (error) {
    return handleApiError(error);
  }
}
