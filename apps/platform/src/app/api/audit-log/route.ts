import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow, requirePermission, buildPaginationParams,
  buildPaginatedResponse, handleApiError,
} from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "AUDIT_LOG:LIST");
    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = buildPaginationParams(searchParams);
    const action = searchParams.get("action");
    const resource = searchParams.get("resource");
    const actorId = searchParams.get("actorId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const search = searchParams.get("search");

    const where: any = {};
    if (action) where.action = action;
    if (resource) where.resource = { contains: resource, mode: "insensitive" };
    if (actorId) where.actorId = actorId;
    if (dateFrom) where.createdAt = { ...where.createdAt, gte: new Date(dateFrom) };
    if (dateTo) where.createdAt = { ...where.createdAt, lte: new Date(dateTo) };
    if (search) {
      where.OR = [
        { resource: { contains: search, mode: "insensitive" } },
        { resourceId: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where, skip, take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);
    return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize));
  } catch (error) { return handleApiError(error); }
}
