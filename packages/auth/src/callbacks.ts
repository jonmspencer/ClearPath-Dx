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
  // On initial sign-in, load roles from database
  if (user?.id) {
    token.userId = user.id;

    const memberships = await prisma.userOrganization.findMany({
      where: { userId: user.id, isActive: true },
      include: { organization: { select: { id: true, type: true } } },
    });

    token.roles = memberships.map((m) => ({
      role: m.role as UserRole,
      organizationId: m.organizationId,
      organizationType: m.organization.type as OrganizationType,
    }));

    // Set active role to primary membership (or first available)
    const primary = memberships.find((m) => m.isPrimary) ?? memberships[0];
    if (primary) {
      token.activeRole = primary.role as UserRole;
      token.activeOrganizationId = primary.organizationId;
      token.activeOrganizationType = primary.organization.type as OrganizationType;
    }
  }

  // Allow switching active role via session update
  if (trigger === "update" && session?.activeRole) {
    token.activeRole = session.activeRole as UserRole;
    token.activeOrganizationId = session.activeOrganizationId as string;
    token.activeOrganizationType = session.activeOrganizationType as OrganizationType;
  }

  // Re-read profile data from DB on any session update (e.g. after profile save)
  if (trigger === "update" && token.userId) {
    const freshUser = await prisma.user.findUnique({
      where: { id: token.userId as string },
      select: { name: true, email: true },
    });
    if (freshUser) {
      token.name = freshUser.name;
      token.email = freshUser.email;
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
  if (token) {
    session.user.id = token.userId as string;
    session.user.name = (token.name as string) ?? null;
    session.user.email = token.email as string;
    session.user.activeRole = token.activeRole as UserRole;
    session.user.activeOrganizationId = token.activeOrganizationId as string;
    session.user.activeOrganizationType = token.activeOrganizationType as OrganizationType;
    session.user.roles = token.roles as Session["user"]["roles"];
  }
  return session;
}
