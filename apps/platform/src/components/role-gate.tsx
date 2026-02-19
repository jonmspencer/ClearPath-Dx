"use client";

import { useSession } from "next-auth/react";
import { hasPermission, hasRole } from "@clearpath/rbac";
import type { Permission, UserRole } from "@clearpath/types";

interface RoleGateProps {
  allowedRoles?: UserRole[];
  requiredPermission?: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({
  allowedRoles,
  requiredPermission,
  children,
  fallback = null,
}: RoleGateProps) {
  const { data: session } = useSession();

  if (!session) return fallback;

  const role = session.user.activeRole;

  if (allowedRoles && !hasRole(role, allowedRoles)) {
    return fallback;
  }

  if (requiredPermission && !hasPermission(role, requiredPermission)) {
    return fallback;
  }

  return <>{children}</>;
}
