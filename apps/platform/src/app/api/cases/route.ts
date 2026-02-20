import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow,
  requirePermission,
  buildPaginationParams,
  buildPaginatedResponse,
  handleApiError,
  successResponse,
} from "@/lib/api-helpers";
import { buildCaseScopeFilter } from "@/lib/data-scoping";
import { createAuditLog } from "@/lib/audit";
import { createCaseSchema } from "@/lib/validations/case";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "DIAGNOSTIC_CASE:LIST");

    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = buildPaginationParams(searchParams);

    const scopeFilter = buildCaseScopeFilter(session.user as any);
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const coordinatorId = searchParams.get("coordinatorId");
    const psychologistId = searchParams.get("psychologistId");

    const where: any = { ...scopeFilter };
    if (priority) where.priority = priority;
    if (coordinatorId) where.coordinatorId = coordinatorId;
    if (psychologistId) where.psychologistId = psychologistId;
    if (search) {
      where.OR = [
        { caseNumber: { contains: search, mode: "insensitive" } },
        { client: { firstName: { contains: search, mode: "insensitive" } } },
        { client: { lastName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.diagnosticCase.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          referral: { select: { id: true, referralNumber: true } },
          client: { select: { id: true, firstName: true, lastName: true } },
          coordinator: { select: { id: true, name: true } },
          psychologist: { select: { id: true, user: { select: { name: true } } } },
          psychometrist: { select: { id: true, user: { select: { name: true } } } },
        },
      }),
      prisma.diagnosticCase.count({ where }),
    ]);

    return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "DIAGNOSTIC_CASE:CREATE");

    const body = await request.json();
    const data = createCaseSchema.parse(body);

    // Generate case number
    const count = await prisma.diagnosticCase.count();
    const caseNumber = `CASE-${(count + 1001).toString().padStart(4, "0")}`;

    const diagnosticCase = await prisma.diagnosticCase.create({
      data: {
        caseNumber,
        referralId: data.referralId,
        clientId: data.clientId,
        priority: data.priority,
        coordinatorId: data.coordinatorId || null,
        schedulerId: data.schedulerId || null,
        psychologistId: data.psychologistId || null,
        psychometristId: data.psychometristId || null,
        targetCompletionDate: data.targetCompletionDate || null,
        notes: data.notes || null,
      },
      include: {
        referral: { select: { id: true, referralNumber: true } },
        client: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await createAuditLog({
      actorId: session.user.id,
      action: "CREATE",
      resource: "DIAGNOSTIC_CASE",
      resourceId: diagnosticCase.id,
      newValues: { caseNumber, referralId: data.referralId, clientId: data.clientId },
    });

    return successResponse(diagnosticCase, "Diagnostic case created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
