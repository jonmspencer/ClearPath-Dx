import { UserRole } from "@clearpath/types";
import type { Permission } from "@clearpath/types";
import { ROLE_PERMISSIONS } from "./permissions";

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/** Roles that can only see data scoped to their organization */
export const ORG_SCOPED_ROLES: UserRole[] = [
  UserRole.ABA_PROVIDER_ADMIN,
  UserRole.ABA_PROVIDER_STAFF,
  UserRole.PEDIATRICIAN_ADMIN,
];

/** Roles that can only see data scoped to themselves */
export const SELF_SCOPED_ROLES: UserRole[] = [
  UserRole.PSYCHOLOGIST,
  UserRole.PSYCHOMETRIST,
  UserRole.PARENT_GUARDIAN,
];
