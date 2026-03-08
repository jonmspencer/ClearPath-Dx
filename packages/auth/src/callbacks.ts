import { prisma } from "@clearpath/database";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import type { UserRole, OrganizationType } from "@clearpath/types";

interface JWTCallbackParams {
  token: JWT;
  user?: { id?: string } | undefined;
  trigger?: "signIn" | "signUp" | "update";
  session?: { activeRole?: string; activeOrganizationId?: string; activeOrganizationType?: string };
}

export async function jwtCallback({ token, user, trigger, session }: JWTCallbackParams) {
  const t = token as any;

  // On initial sign-in, load roles from database
  if (user?.id) {
    t.userId = user.id;

    const memberships = await prisma.userOrganization.findMany({
      where: { userId: user.id, isActive: true },
      include: { organization: { select: { id: true, type: true } } },
    });

    t.roles = memberships.map((m) => ({
      role: m.role as UserRole,
      organizationId: m.organizationId,
      organizationType: m.organization.type as OrganizationType,
    }));

    // Set active role to primary membership (or first available)
    const primary = memberships.find((m) => m.isPrimary) ?? memberships[0];
    if (primary) {
      t.activeRole = primary.role as UserRole;
      t.activeOrganizationId = primary.organizationId;
      t.activeOrganizationType = primary.organization.type as OrganizationType;
    }
  }

  // Allow switching active role via session update
  if (trigger === "update" && session?.activeRole) {
    t.activeRole = session.activeRole as UserRole;
    t.activeOrganizationId = session.activeOrganizationId as string;
    t.activeOrganizationType = session.activeOrganizationType as OrganizationType;
  }

  // Re-read profile data from DB on any session update (e.g. after profile save)
  if (trigger === "update" && t.userId) {
    const freshUser = await prisma.user.findUnique({
      where: { id: t.userId as string },
      select: { name: true, email: true },
    });
    if (freshUser) {
      t.name = freshUser.name;
      t.email = freshUser.email;
    }
  }

  return token;
}

export async function sessionCallback({
  session,
  token,
}: {
  session: Session;
  token: JWT;
}) {
  if (token && session.user) {
    const user = session.user as any;
    user.id = token.userId as string;
    user.name = ((token as any).name as string) ?? null;
    user.email = (token as any).email as string;
    user.activeRole = token.activeRole as UserRole;
    user.activeOrganizationId = token.activeOrganizationId as string;
    user.activeOrganizationType = token.activeOrganizationType as OrganizationType;
    user.roles = (token as any).roles;
  }
  return session;
}
