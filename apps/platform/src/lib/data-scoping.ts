import { ORG_SCOPED_ROLES, SELF_SCOPED_ROLES } from "@clearpath/rbac";
import type { UserRole } from "@clearpath/types";

interface SessionUser {
  id: string;
  activeRole: UserRole;
  activeOrganizationId: string;
}

/**
 * Build org-level scope filter for resources that have a direct organizationId.
 * E.g., organizations, billing records, provider profiles.
 */
export function buildOrgScopeFilter(user: SessionUser): Record<string, unknown> {
  if (ORG_SCOPED_ROLES.includes(user.activeRole as any)) {
    return { organizationId: user.activeOrganizationId };
  }
  return {};
}

/**
 * Build scope filter for referrals (org-scoped roles filter by referringOrgId).
 */
export function buildReferralScopeFilter(user: SessionUser): Record<string, unknown> {
  if (ORG_SCOPED_ROLES.includes(user.activeRole as any)) {
    return { referringOrgId: user.activeOrganizationId };
  }
  return {};
}

/**
 * Build scope filter for clients (org-scoped roles filter by referringOrgId).
 */
export function buildClientScopeFilter(user: SessionUser): Record<string, unknown> {
  if (ORG_SCOPED_ROLES.includes(user.activeRole as any)) {
    return { referringOrgId: user.activeOrganizationId };
  }
  return {};
}

/**
 * Build scope filter for diagnostic cases.
 * - Org-scoped: filter via referral.referringOrgId
 * - Self-scoped providers: filter by their provider profile assignment
 * - Parent/guardian: filter by clientId (resolved elsewhere)
 */
export function buildCaseScopeFilter(
  user: SessionUser,
  providerProfileId?: string | null
): Record<string, unknown> {
  if (ORG_SCOPED_ROLES.includes(user.activeRole as any)) {
    return {
      referral: { referringOrgId: user.activeOrganizationId },
    };
  }
  if (SELF_SCOPED_ROLES.includes(user.activeRole as any) && providerProfileId) {
    return {
      OR: [
        { psychologistId: providerProfileId },
        { psychometristId: providerProfileId },
      ],
    };
  }
  return {};
}

/**
 * Check if a role is org-scoped.
 */
export function isOrgScoped(role: UserRole): boolean {
  return ORG_SCOPED_ROLES.includes(role as any);
}

/**
 * Check if a role is self-scoped (provider or parent).
 */
export function isSelfScoped(role: UserRole): boolean {
  return SELF_SCOPED_ROLES.includes(role as any);
}
