import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow,
  requirePermission,
  handleApiError,
  successResponse,
  ApiError,
} from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { guardianSchema } from "@/lib/validations/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "CLIENT:READ");

    const { id } = await params;

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new ApiError("Client not found", 404);
    }

    const guardians = await prisma.guardian.findMany({
      where: { clientId: id },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    });

    return successResponse(guardians);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "CLIENT:UPDATE");

    const { id } = await params;
    const body = await request.json();
    const data = guardianSchema.parse(body);

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new ApiError("Client not found", 404);
    }

    // If this guardian is marked as primary, unset any existing primary
    if (data.isPrimary) {
      await prisma.guardian.updateMany({
        where: { clientId: id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const guardian = await prisma.guardian.create({
      data: {
        clientId: id,
        firstName: data.firstName,
        lastName: data.lastName,
        relationship: data.relationship,
        email: data.email || null,
        phone: data.phone || null,
        isPrimary: data.isPrimary,
      },
    });

    await createAuditLog({
      actorId: session.user.id,
      action: "CREATE",
      resource: "GUARDIAN",
      resourceId: guardian.id,
      newValues: {
        clientId: id,
        guardianName: `${data.firstName} ${data.lastName}`,
      },
    });

    return successResponse(guardian, "Guardian added successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
