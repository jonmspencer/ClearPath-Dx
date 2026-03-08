import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow, requirePermission, buildPaginationParams,
  buildPaginatedResponse, handleApiError, successResponse,
} from "@/lib/api-helpers";
import { buildOrgScopeFilter } from "@/lib/data-scoping";
import { createAuditLog } from "@/lib/audit";
import { createProviderSchema } from "@/lib/validations/provider";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "PROVIDER:LIST");

    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = buildPaginationParams(searchParams);

    const scopeFilter = buildOrgScopeFilter(session.user as any);
    const search = searchParams.get("search");
    const providerType = searchParams.get("providerType");
    const isAcceptingCases = searchParams.get("isAcceptingCases");

    const where: any = { ...scopeFilter };
    if (providerType) where.providerType = providerType;
    if (isAcceptingCases !== null && isAcceptingCases !== "") {
      where.isAcceptingCases = isAcceptingCases === "true";
    }
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [data, total] = await Promise.all([
      prisma.providerProfile.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          organization: { select: { id: true, name: true } },
        },
      }),
      prisma.providerProfile.count({ where }),
    ]);

    return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "PROVIDER:CREATE");

    const body = await request.json();
    const data = createProviderSchema.parse(body);

    const provider = await prisma.providerProfile.create({
      data: {
        userId: data.userId,
        organizationId: data.organizationId,
        providerType: data.providerType,
        licenseNumber: data.licenseNumber || null,
        licenseState: data.licenseState || null,
        npiNumber: data.npiNumber || null,
        specialties: data.specialties,
        yearsExperience: data.yearsExperience ?? null,
        bio: data.bio || null,
        maxWeeklyCases: data.maxWeeklyCases,
        isAcceptingCases: data.isAcceptingCases,
        serviceRadius: data.serviceRadius ?? null,
        serviceZipCodes: data.serviceZipCodes,
      },
    });

    await createAuditLog({
      actorId: session.user.id,
      action: "CREATE",
      resource: "PROVIDER",
      resourceId: provider.id,
      newValues: { userId: data.userId, providerType: data.providerType },
    });

    return successResponse(provider, "Provider profile created");
  } catch (error) {
    return handleApiError(error);
  }
}
