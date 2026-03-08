declare module "@auth/core/types" {
  interface User {
    activeRole?: string;
    activeOrganizationId?: string;
    activeOrganizationType?: string;
    roles?: Array<{
      role: string;
      organizationId: string;
      organizationType: string;
    }>;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      activeRole: string;
      activeOrganizationId: string;
      activeOrganizationType: string;
      roles: Array<{
        role: string;
        organizationId: string;
        organizationType: string;
      }>;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    activeRole: string;
    activeOrganizationId: string;
    activeOrganizationType: string;
    roles: Array<{
      role: string;
      organizationId: string;
      organizationType: string;
    }>;
  }
}
