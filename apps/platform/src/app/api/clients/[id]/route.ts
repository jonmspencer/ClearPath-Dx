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
import { updateClientSchema } from "@/lib/validations/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "CLIENT:READ");

    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        referringOrg: { select: { id: true, name: true, type: true } },
        referral: { select: { id: true, referralNumber: true, status: true } },
        guardians: true,
        diagnosticCases: {
          select: {
            id: true,
            caseNumber: true,
            priority: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        careFlags: {
          select: {
            id: true,
            title: true,
            severity: true,
            isResolved: true,
            description: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) {
      throw new ApiError("Client not found", 404);
    }

    return successResponse(client);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "CLIENT:UPDATE");

    const { id } = await params;
    const body = await request.json();
    const data = updateClientSchema.parse(body);

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Client not found", 404);
    }

    const client = await prisma.client.update({
      where: { id },
      data,
      include: {
        referringOrg: { select: { id: true, name: true } },
        guardians: true,
      },
    });

    await createAuditLog({
      actorId: session.user.id,
      action: "UPDATE",
      resource: "CLIENT",
      resourceId: id,
      oldValues: {
        firstName: existing.firstName,
        lastName: existing.lastName,
      },
      newValues: data,
    });

    return successResponse(client, "Client updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    requirePermission(session, "CLIENT:DELETE");

    const { id } = await params;

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Client not found", 404);
    }

    await prisma.client.delete({ where: { id } });

    await createAuditLog({
      actorId: session.user.id,
      action: "DELETE",
      resource: "CLIENT",
      resourceId: id,
      oldValues: { clientName: `${existing.firstName} ${existing.lastName}` },
    });

    return successResponse(null, "Client deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
