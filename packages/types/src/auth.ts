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

// Auth.js module augmentation
declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    activeRole: UserRole;
    activeOrganizationId: string;
    activeOrganizationType: OrganizationType;
    roles: UserRoleMembership[];
  }
}
