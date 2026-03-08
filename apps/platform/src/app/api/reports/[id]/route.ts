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
import { SELF_SCOPED_ROLES } from "@clearpath/rbac";
import { getProviderProfileId, isSelfScoped } from "@/lib/data-scoping";

async function verifyReportAccess(
  report: { authorId: string; diagnosticCase?: { psychologistId?: string | null; psychometristId?: string | null } | null },
  session: any
): Promise<boolean> {
  if (!isSelfScoped((session.user as any).activeRole as any)) return true;
  const providerProfileId = await getProviderProfileId(session.user.id);
  if (!providerProfileId) return false;
  if (report.authorId === providerProfileId) return true;
  const dc = report.diagnosticCase;
  if (dc && (dc.psychologistId === providerProfileId || dc.psychometristId === providerProfileId)) return true;
  return false;
}

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
            psychologistId: true, psychometristId: true,
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

    const hasAccess = await verifyReportAccess(report, session);
    if (!hasAccess) throw new ApiError("Report not found", 404);

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

    if (isSelfScoped((session.user as any).activeRole as any)) {
      const providerProfileId = await getProviderProfileId(session.user.id);
      if (!providerProfileId || existing.authorId !== providerProfileId) {
        throw new ApiError("Forbidden", 403);
      }
    }

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

    if (isSelfScoped((session.user as any).activeRole as any)) {
      const providerProfileId = await getProviderProfileId(session.user.id);
      if (!providerProfileId || existing.authorId !== providerProfileId) {
        throw new ApiError("Forbidden", 403);
      }
    }

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
