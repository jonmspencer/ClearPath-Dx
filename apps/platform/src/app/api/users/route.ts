import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow, requirePermission, buildPaginationParams,
  buildPaginatedResponse, handleApiError, successResponse,
} from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { createUserSchema } from "@/lib/validations/user";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "USER:LIST");
    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = buildPaginationParams(searchParams);
    const search = searchParams.get("search");
    const active = searchParams.get("active");

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (active === "true") where.isActive = true;
    if (active === "false") where.isActive = false;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          image: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          organizationMemberships: {
            include: { organization: { select: { id: true, name: true } } },
          },
          _count: { select: { auditLogs: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    return NextResponse.json(buildPaginatedResponse(data, total, page, pageSize));
  } catch (error) { return handleApiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "USER:CREATE");
    const body = await request.json();
    const data = createUserSchema.parse(body);

    const bcrypt = require("bcryptjs");
    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name || null,
        phone: data.phone || null,
        passwordHash,
        ...(data.organizationId && data.role
          ? {
              organizationMemberships: {
                create: {
                  organizationId: data.organizationId,
                  role: data.role as any,
                  isPrimary: data.isPrimary ?? true,
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    await createAuditLog({ actorId: session.user.id, action: "CREATE", resource: "USER", resourceId: user.id, newValues: { email: data.email } });
    return successResponse(user, "User created");
  } catch (error) { return handleApiError(error); }
}
