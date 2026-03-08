import type { UserRole, OrganizationType } from "./enums";

export interface UserRoleMembership {
  role: UserRole;
  organizationId: string;
  organizationType: OrganizationType;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  activeRole: UserRole;
  activeOrganizationId: string;
  activeOrganizationType: OrganizationType;
  roles: UserRoleMembership[];
}

// Auth.js module augmentation is handled in apps/platform/src/types/next-auth.d.ts
// to avoid conflicting declarations across packages.
