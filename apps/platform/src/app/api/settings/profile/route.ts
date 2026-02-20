import { NextRequest } from "next/server";
import { prisma } from "@clearpath/database";
import {
  getSessionOrThrow, handleApiError, successResponse,
} from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/audit";
import { updateProfileSchema } from "@/lib/validations/settings";

export async function GET() {
  try {
    const session = await getSessionOrThrow();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return successResponse(user);
  } catch (error) { return handleApiError(error); }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, phone: true },
    });

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    await createAuditLog({
      actorId: session.user.id,
      action: "UPDATE",
      resource: "USER",
      resourceId: user.id,
      oldValues: existing as any,
      newValues: data as any,
    });

    return successResponse(user, "Profile updated");
  } catch (error) { return handleApiError(error); }
}
