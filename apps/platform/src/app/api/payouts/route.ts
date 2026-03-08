import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow,
  requirePermission,
  buildPaginationParams,
  buildPaginatedResponse,
  handleApiError,
} from "@/lib/api-helpers";
import { getProviderProfileId, isSelfScoped } from "@/lib/data-scoping";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "PAYOUT:LIST");

    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = buildPaginationParams(searchParams);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    // Self-scoped providers can only see their own payouts
    if (isSelfScoped(session.user.activeRole as any)) {
      const providerProfileId = await getProviderProfileId(session.user.id);
      if (providerProfileId) {
        where.providerId = providerProfileId;
      }
    }

    const [data, total] = await Promise.all([
      prisma.providerPayoutLedger.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          diagnosticCase: {
            select: {
              id: true,
              caseNumber: true,
              client: { select: { firstName: true, lastName: true } },
            },
          },
          provider: {
            select: {
              id: true,
              user: { select: { name: true } },
            },
          },
        },
      }),
      prisma.providerPayoutLedger.count({ where }),
    ]);

    return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize));
  } catch (error) {
    return handleApiError(error);
  }
}
