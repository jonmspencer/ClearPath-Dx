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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "REPORT:UPDATE");
    const { id } = await params;

    const report = await prisma.diagnosticReport.findUnique({ where: { id } });
    if (!report) throw new ApiError("Report not found", 404);
    if (report.status !== "DRAFT") throw new ApiError("Report must be in DRAFT status to submit for review", 400);

    const body = await request.json();
    const reviewerId = body.reviewerId;

    // Update report status
    await prisma.diagnosticReport.update({
      where: { id },
      data: { status: "IN_REVIEW", submittedAt: new Date() },
    });

    // Create review queue item
    if (reviewerId) {
      await prisma.reportReviewQueueItem.create({
        data: { reportId: id, reviewerId },
      });
    }

    await createAuditLog({
      actorId: session.user.id,
      action: "UPDATE",
      resource: "REPORT",
      resourceId: id,
      newValues: { status: "IN_REVIEW", reviewerId },
    });

    return successResponse(null, "Report submitted for review");
  } catch (error) {
    return handleApiError(error);
  }
}
