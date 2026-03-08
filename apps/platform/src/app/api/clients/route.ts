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
import { buildClientScopeFilter } from "@/lib/data-scoping";
import { createAuditLog } from "@/lib/audit";
import { createClientSchema } from "@/lib/validations/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "CLIENT:LIST");

    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = buildPaginationParams(searchParams);

    const scopeFilter = buildClientScopeFilter(session.user as any);
    const search = searchParams.get("search");
    const orgId = searchParams.get("orgId");

    const where: any = { ...scopeFilter };
    if (orgId) where.referringOrgId = orgId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { preferredName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          referringOrg: { select: { id: true, name: true } },
          referral: { select: { id: true, referralNumber: true } },
          guardians: { select: { id: true, firstName: true, lastName: true, isPrimary: true } },
          _count: { select: { diagnosticCases: true, careFlags: true } },
        },
      }),
      prisma.client.count({ where }),
    ]);

    return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "CLIENT:CREATE");

    const body = await request.json();
    const data = createClientSchema.parse(body);

    const { guardians, ...clientData } = data;

    const client = await prisma.client.create({
      data: {
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        dateOfBirth: clientData.dateOfBirth,
        gender: clientData.gender || null,
        preferredName: clientData.preferredName || null,
        primaryLanguage: clientData.primaryLanguage || null,
        schoolName: clientData.schoolName || null,
        grade: clientData.grade || null,
        address: clientData.address || null,
        city: clientData.city || null,
        state: clientData.state || null,
        zipCode: clientData.zipCode || null,
        insuranceProvider: clientData.insuranceProvider || null,
        insurancePolicyId: clientData.insurancePolicyId || null,
        insuranceGroupId: clientData.insuranceGroupId || null,
        referralId: clientData.referralId,
        referringOrgId: clientData.referringOrgId,
        guardians: guardians?.length
          ? {
              create: guardians.map((g: any) => ({
                firstName: g.firstName,
                lastName: g.lastName,
                relationship: g.relationship,
                email: g.email || null,
                phone: g.phone || null,
                isPrimary: g.isPrimary,
              })),
            }
          : undefined,
      },
      include: {
        referringOrg: { select: { id: true, name: true } },
        guardians: true,
      },
    });

    await createAuditLog({
      actorId: session.user.id,
      action: "CREATE",
      resource: "CLIENT",
      resourceId: client.id,
      newValues: { clientName: `${data.firstName} ${data.lastName}` },
    });

    return successResponse(client, "Client created successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
