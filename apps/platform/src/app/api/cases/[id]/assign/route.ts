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
import { assignCaseSchema } from "@/lib/validations/case";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "DIAGNOSTIC_CASE:ASSIGN");

    const { id } = await params;
    const body = await request.json();
    const data = assignCaseSchema.parse(body);

    const existing = await prisma.diagnosticCase.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Diagnostic case not found", 404);
    }

    const updateData: any = {};
    if (data.psychologistId !== undefined) updateData.psychologistId = data.psychologistId;
    if (data.psychometristId !== undefined) updateData.psychometristId = data.psychometristId;
    if (data.coordinatorId !== undefined) updateData.coordinatorId = data.coordinatorId;
    if (data.schedulerId !== undefined) updateData.schedulerId = data.schedulerId;

    const diagnosticCase = await prisma.diagnosticCase.update({
      where: { id },
      data: updateData,
      include: {
        referral: { select: { id: true, referralNumber: true } },
        client: { select: { id: true, firstName: true, lastName: true } },
        coordinator: { select: { id: true, name: true } },
        scheduler: { select: { id: true, name: true } },
        psychologist: { select: { id: true, user: { select: { name: true } } } },
        psychometrist: { select: { id: true, user: { select: { name: true } } } },
      },
    });

    await createAuditLog({
      actorId: session.user.id,
      action: "UPDATE",
      resource: "DIAGNOSTIC_CASE",
      resourceId: id,
      metadata: { action: "ASSIGN_PROVIDERS" },
      oldValues: {
        psychologistId: existing.psychologistId,
        psychometristId: existing.psychometristId,
        coordinatorId: existing.coordinatorId,
        schedulerId: existing.schedulerId,
      },
      newValues: data,
    });

    return successResponse(diagnosticCase, "Providers assigned successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
