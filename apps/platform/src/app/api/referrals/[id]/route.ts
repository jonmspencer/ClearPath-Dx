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
import { updateReferralSchema } from "@/lib/validations/referral";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "REFERRAL:READ");

    const { id } = await params;

    const referral = await prisma.referral.findUnique({
      where: { id },
      include: {
        referringOrg: { select: { id: true, name: true, type: true } },
        referralSource: { select: { id: true, label: true, channel: true } },
        client: { select: { id: true, firstName: true, lastName: true } },
        diagnosticCase: { select: { id: true, caseNumber: true } },
        statusHistory: {
          orderBy: { changedAt: "asc" },
        },
      },
    });

    if (!referral) {
      throw new ApiError("Referral not found", 404);
    }

    return successResponse(referral);
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
    requirePermission(session, "REFERRAL:UPDATE");

    const { id } = await params;
    const body = await request.json();
    const data = updateReferralSchema.parse(body);

    const existing = await prisma.referral.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Referral not found", 404);
    }

    const updateData: any = { ...data };

    // Track status changes
    if (data.status && data.status !== existing.status) {
      // Set timestamp fields based on status
      if (data.status === "INTAKE_IN_PROGRESS" && !existing.intakeStartedAt) {
        updateData.intakeStartedAt = new Date();
      }
      if (data.status === "PARENT_CONTACTED" && !existing.parentContactedAt) {
        updateData.parentContactedAt = new Date();
      }
      if (data.status === "CLOSED") {
        updateData.closedAt = new Date();
      }

      await prisma.referralStatusHistory.create({
        data: {
          referralId: id,
          fromStatus: existing.status,
          toStatus: data.status,
          changedBy: session.user.id,
        },
      });
    }

    const referral = await prisma.referral.update({
      where: { id },
      data: updateData,
      include: {
        referringOrg: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      actorId: session.user.id,
      action: "UPDATE",
      resource: "REFERRAL",
      resourceId: id,
      oldValues: { status: existing.status },
      newValues: data,
    });

    return successResponse(referral, "Referral updated successfully");
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
    requirePermission(session, "REFERRAL:DELETE");

    const { id } = await params;

    const existing = await prisma.referral.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Referral not found", 404);
    }

    await prisma.referral.delete({ where: { id } });

    await createAuditLog({
      actorId: session.user.id,
      action: "DELETE",
      resource: "REFERRAL",
      resourceId: id,
      oldValues: { referralNumber: existing.referralNumber },
    });

    return successResponse(null, "Referral deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
