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
import { createAuditLog } from "@/lib/audit";
import { createReportSchema } from "@/lib/validations/report";
import { SELF_SCOPED_ROLES } from "@clearpath/rbac";
import { getProviderProfileId, isSelfScoped } from "@/lib/data-scoping";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "REPORT:LIST");

    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = buildPaginationParams(searchParams);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { diagnosticCase: { caseNumber: { contains: search, mode: "insensitive" } } },
        { summary: { contains: search, mode: "insensitive" } },
      ];
    }

    // Scope reports for self-scoped roles (providers): only their authored reports
    // or reports belonging to cases assigned to them
    if (isSelfScoped(session.user.activeRole as any)) {
      const providerProfileId = await getProviderProfileId(session.user.id);
      if (providerProfileId) {
        where.AND = [
          ...(where.AND || []),
          {
            OR: [
              { authorId: providerProfileId },
              { diagnosticCase: { OR: [{ psychologistId: providerProfileId }, { psychometristId: providerProfileId }] } },
            ],
          },
        ];
      }
    }

    const [data, total] = await Promise.all([
      prisma.diagnosticReport.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          diagnosticCase: { select: { id: true, caseNumber: true, client: { select: { firstName: true, lastName: true } } } },
          author: { select: { id: true, user: { select: { name: true } } } },
        },
      }),
      prisma.diagnosticReport.count({ where }),
    ]);

    return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "REPORT:CREATE");

    const body = await request.json();
    const data = createReportSchema.parse(body);

    // Find the author's provider profile
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!providerProfile) {
      return NextResponse.json({ success: false, error: "No provider profile found" }, { status: 400 });
    }

    const report = await prisma.diagnosticReport.create({
      data: {
        caseId: data.caseId,
        authorId: providerProfile.id,
        status: "DRAFT",
        reportContent: data.reportContent || null,
        summary: data.summary || null,
        diagnoses: data.diagnoses,
        recommendations: data.recommendations || null,
      },
      include: {
        diagnosticCase: { select: { caseNumber: true } },
      },
    });

    await createAuditLog({
      actorId: session.user.id,
      action: "CREATE",
      resource: "REPORT",
      resourceId: report.id,
      newValues: { caseId: data.caseId },
    });

    return successResponse(report, "Report created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
