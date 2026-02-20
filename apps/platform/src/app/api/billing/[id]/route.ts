import { NextRequest } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow, requirePermission, handleApiError,
  successResponse, ApiError,
} from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { updateBillingSchema } from "@/lib/validations/billing";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "BILLING:READ");
    const { id } = await params;
    const record = await prisma.billingRecord.findUnique({
      where: { id },
      include: {
        diagnosticCase: { select: { id: true, caseNumber: true, client: { select: { id: true, firstName: true, lastName: true } } } },
        organization: { select: { id: true, name: true } },
      },
    });
    if (!record) throw new ApiError("Billing record not found", 404);
    return successResponse(record);
  } catch (error) { return handleApiError(error); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "BILLING:UPDATE");
    const { id } = await params;
    const existing = await prisma.billingRecord.findUnique({ where: { id } });
    if (!existing) throw new ApiError("Billing record not found", 404);

    const body = await request.json();
    const data = updateBillingSchema.parse(body);
    const updateData: any = { ...data };

    if (data.status === "SUBMITTED" && !existing.submittedAt) updateData.submittedAt = new Date();
    if (data.status === "PAID" && !existing.paidAt) updateData.paidAt = new Date();

    const record = await prisma.billingRecord.update({ where: { id }, data: updateData });
    await createAuditLog({ actorId: session.user.id, action: "UPDATE", resource: "BILLING", resourceId: id, oldValues: { status: existing.status }, newValues: data });
    return successResponse(record, "Billing record updated");
  } catch (error) { return handleApiError(error); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "BILLING:UPDATE");
    const { id } = await params;
    const existing = await prisma.billingRecord.findUnique({ where: { id } });
    if (!existing) throw new ApiError("Billing record not found", 404);
    await prisma.billingRecord.delete({ where: { id } });
    await createAuditLog({ actorId: session.user.id, action: "DELETE", resource: "BILLING", resourceId: id });
    return successResponse(null, "Billing record deleted");
  } catch (error) { return handleApiError(error); }
}
