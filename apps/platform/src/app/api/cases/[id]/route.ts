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
import { updateCaseSchema } from "@/lib/validations/case";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "DIAGNOSTIC_CASE:READ");

    const { id } = await params;

    const diagnosticCase = await prisma.diagnosticCase.findUnique({
      where: { id },
      include: {
        referral: {
          select: {
            id: true,
            referralNumber: true,
            status: true,
            childFirstName: true,
            childLastName: true,
          },
        },
        client: {
          select: { id: true, firstName: true, lastName: true, dateOfBirth: true },
        },
        coordinator: { select: { id: true, name: true, email: true } },
        scheduler: { select: { id: true, name: true, email: true } },
        psychologist: {
          select: {
            id: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        psychometrist: {
          select: {
            id: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        interviews: {
          orderBy: { scheduledStart: "asc" },
          select: {
            id: true,
            interviewType: true,
            scheduledStart: true,
            scheduledEnd: true,
            isCompleted: true,
            isCancelled: true,
          },
        },
        report: { select: { id: true, status: true } },
        billingRecords: { select: { id: true, status: true, amountBilled: true } },
        careFlags: {
          where: { resolvedAt: null },
          select: { id: true, severity: true, description: true },
        },
      },
    });

    if (!diagnosticCase) {
      throw new ApiError("Diagnostic case not found", 404);
    }

    return successResponse(diagnosticCase);
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
    requirePermission(session, "DIAGNOSTIC_CASE:UPDATE");

    const { id } = await params;
    const body = await request.json();
    const data = updateCaseSchema.parse(body);

    const existing = await prisma.diagnosticCase.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Diagnostic case not found", 404);
    }

    const diagnosticCase = await prisma.diagnosticCase.update({
      where: { id },
      data,
      include: {
        referral: { select: { id: true, referralNumber: true } },
        client: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await createAuditLog({
      actorId: session.user.id,
      action: "UPDATE",
      resource: "DIAGNOSTIC_CASE",
      resourceId: id,
      oldValues: {
        priority: existing.priority,
        coordinatorId: existing.coordinatorId,
        psychologistId: existing.psychologistId,
        psychometristId: existing.psychometristId,
      },
      newValues: data,
    });

    return successResponse(diagnosticCase, "Diagnostic case updated successfully");
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
    requirePermission(session, "DIAGNOSTIC_CASE:DELETE");

    const { id } = await params;

    const existing = await prisma.diagnosticCase.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Diagnostic case not found", 404);
    }

    await prisma.diagnosticCase.delete({ where: { id } });

    await createAuditLog({
      actorId: session.user.id,
      action: "DELETE",
      resource: "DIAGNOSTIC_CASE",
      resourceId: id,
      oldValues: { caseNumber: existing.caseNumber },
    });

    return successResponse(null, "Diagnostic case deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
