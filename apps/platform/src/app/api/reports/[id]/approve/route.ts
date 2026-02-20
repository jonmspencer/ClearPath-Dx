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
import { reviewDecisionSchema } from "@/lib/validations/report";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "REPORT:APPROVE");
    const { id } = await params;

    const report = await prisma.diagnosticReport.findUnique({ where: { id } });
    if (!report) throw new ApiError("Report not found", 404);
    if (report.status !== "IN_REVIEW") throw new ApiError("Report must be in IN_REVIEW status", 400);

    const body = await request.json();
    const { isApproved, reviewNotes } = reviewDecisionSchema.parse(body);

    const newStatus = isApproved ? "APPROVED" : "REVISION_REQUESTED";

    await prisma.diagnosticReport.update({
      where: { id },
      data: {
        status: newStatus,
        approvedAt: isApproved ? new Date() : null,
      },
    });

    // Update review queue item
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (providerProfile) {
      const queueItem = await prisma.reportReviewQueueItem.findFirst({
        where: { reportId: id, reviewerId: providerProfile.id, completedAt: null },
      });
      if (queueItem) {
        await prisma.reportReviewQueueItem.update({
          where: { id: queueItem.id },
          data: { completedAt: new Date(), isApproved, reviewNotes },
        });
      }
    }

    // If approved, advance referral status
    if (isApproved && report.caseId) {
      const diagnosticCase = await prisma.diagnosticCase.findUnique({
        where: { id: report.caseId },
        select: { referralId: true },
      });
      if (diagnosticCase) {
        await prisma.referral.update({
          where: { id: diagnosticCase.referralId },
          data: { status: "REPORT_APPROVED" },
        });
      }
    }

    await createAuditLog({
      actorId: session.user.id,
      action: "UPDATE",
      resource: "REPORT",
      resourceId: id,
      newValues: { status: newStatus, isApproved, reviewNotes },
    });

    return successResponse(null, isApproved ? "Report approved" : "Revision requested");
  } catch (error) {
    return handleApiError(error);
  }
}
