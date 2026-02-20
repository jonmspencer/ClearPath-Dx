import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow, requirePermission, buildPaginationParams,
  buildPaginatedResponse, handleApiError, successResponse,
} from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { createBillingSchema } from "@/lib/validations/billing";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "BILLING:LIST");
    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = buildPaginationParams(searchParams);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.billingRecord.findMany({
        where, skip, take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          diagnosticCase: { select: { id: true, caseNumber: true, client: { select: { firstName: true, lastName: true } } } },
          organization: { select: { id: true, name: true } },
        },
      }),
      prisma.billingRecord.count({ where }),
    ]);
    return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize));
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "BILLING:CREATE");
    const body = await request.json();
    const data = createBillingSchema.parse(body);

    const record = await prisma.billingRecord.create({
      data: {
        caseId: data.caseId,
        organizationId: data.organizationId,
        status: "PENDING",
        cptCode: data.cptCode || null,
        billedAmount: data.billedAmount || null,
        allowedAmount: data.allowedAmount || null,
        payerName: data.payerName || null,
        claimNumber: data.claimNumber || null,
        notes: data.notes || null,
      },
    });

    await createAuditLog({ actorId: session.user.id, action: "CREATE", resource: "BILLING", resourceId: record.id, newValues: { caseId: data.caseId } });
    return successResponse(record, "Billing record created");
  } catch (error) { return handleApiError(error); }
}
