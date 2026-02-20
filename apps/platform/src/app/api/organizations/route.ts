import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow, requirePermission, buildPaginationParams,
  buildPaginatedResponse, handleApiError, successResponse,
} from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { buildOrgScopeFilter } from "@/lib/data-scoping";
import { createOrganizationSchema } from "@/lib/validations/organization";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "ORGANIZATION:LIST");
    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = buildPaginationParams(searchParams);
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const isActive = searchParams.get("isActive");

    const scopeFilter = buildOrgScopeFilter(session.user as any);
    // For Organization model, organizationId maps to the org's own id
    const where: any = {};
    if (scopeFilter.organizationId) {
      where.id = scopeFilter.organizationId;
    }
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (type) where.type = type;
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true";
    }

    const [data, total] = await Promise.all([
      prisma.organization.findMany({
        where, skip, take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { members: true, referrals: true, clients: true } },
        },
      }),
      prisma.organization.count({ where }),
    ]);
    return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize));
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "ORGANIZATION:CREATE");
    const body = await request.json();
    const data = createOrganizationSchema.parse(body);

    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        type: data.type,
        phone: data.phone || null,
        fax: data.fax || null,
        email: data.email || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zipCode: data.zipCode || null,
        website: data.website || null,
        npiNumber: data.npiNumber || null,
        taxId: data.taxId || null,
        accountManagerId: data.accountManagerId || null,
      },
    });

    await createAuditLog({ actorId: session.user.id, action: "CREATE", resource: "ORGANIZATION", resourceId: organization.id, newValues: { name: data.name, type: data.type } });
    return successResponse(organization, "Organization created");
  } catch (error) { return handleApiError(error); }
}
