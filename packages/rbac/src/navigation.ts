import { UserRole } from "@clearpath/types";

export interface NavItem {
  label: string;
  href: string;
  icon: string; // Lucide icon name (resolved in UI layer)
  roles: UserRole[];
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    roles: Object.values(UserRole),
  },
  {
    label: "Referrals",
    href: "/referrals",
    icon: "FileText",
    roles: [
      UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INTAKE_COORDINATOR,
      UserRole.SCHEDULER, UserRole.ACCOUNT_MANAGER,
      UserRole.COMMUNITY_DEVELOPMENT_MANAGER,
      UserRole.ABA_PROVIDER_ADMIN, UserRole.ABA_PROVIDER_STAFF,
      UserRole.PEDIATRICIAN_ADMIN,
    ],
  },
  {
    label: "Clients",
    href: "/clients",
    icon: "Users",
    roles: [
      UserRole.SUPER_ADMIN, UserRole.ADMIN,
      UserRole.INTAKE_COORDINATOR, UserRole.SCHEDULER,
      UserRole.ACCOUNT_MANAGER,
      UserRole.PSYCHOLOGIST, UserRole.PSYCHOMETRIST,
      UserRole.ABA_PROVIDER_ADMIN, UserRole.ABA_PROVIDER_STAFF,
      UserRole.PEDIATRICIAN_ADMIN, UserRole.PARENT_GUARDIAN,
    ],
  },
  {
    label: "Cases",
    href: "/cases",
    icon: "Briefcase",
    roles: [
      UserRole.SUPER_ADMIN, UserRole.ADMIN,
      UserRole.INTAKE_COORDINATOR, UserRole.SCHEDULER,
      UserRole.ACCOUNT_MANAGER,
      UserRole.PSYCHOLOGIST, UserRole.PSYCHOMETRIST,
      UserRole.ABA_PROVIDER_ADMIN, UserRole.ABA_PROVIDER_STAFF,
      UserRole.PEDIATRICIAN_ADMIN, UserRole.PARENT_GUARDIAN,
    ],
  },
  {
    label: "Scheduling",
    href: "/scheduling",
    icon: "Calendar",
    roles: [
      UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SCHEDULER,
      UserRole.PSYCHOLOGIST, UserRole.PSYCHOMETRIST,
    ],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "ClipboardCheck",
    roles: [
      UserRole.SUPER_ADMIN, UserRole.ADMIN,
      UserRole.PSYCHOLOGIST, UserRole.PSYCHOMETRIST,
      UserRole.ABA_PROVIDER_ADMIN, UserRole.ABA_PROVIDER_STAFF,
      UserRole.PEDIATRICIAN_ADMIN, UserRole.PARENT_GUARDIAN,
    ],
  },
  {
    label: "Billing",
    href: "/billing",
    icon: "DollarSign",
    roles: [UserRole.SUPER_ADMIN, UserRole.FINANCE_ADMIN, UserRole.ADMIN],
  },
  {
    label: "Providers",
    href: "/providers",
    icon: "Activity",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SCHEDULER],
  },
  {
    label: "Organizations",
    href: "/organizations",
    icon: "Building2",
    roles: [
      UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNT_MANAGER,
      UserRole.ABA_PROVIDER_ADMIN, UserRole.PEDIATRICIAN_ADMIN,
    ],
  },
  {
    label: "Users",
    href: "/users",
    icon: "UserCog",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ABA_PROVIDER_ADMIN],
  },
  {
    label: "Audit Log",
    href: "/audit-log",
    icon: "Shield",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE_ADMIN],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "Settings",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
];

export function getNavigationForRole(role: UserRole): NavItem[] {
  return NAVIGATION_ITEMS.filter((item) => item.roles.includes(role));
}

export function getDashboardPath(role: UserRole): string {
  const rolePathMap: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: "/dashboard/super-admin",
    [UserRole.FINANCE_ADMIN]: "/dashboard/finance-admin",
    [UserRole.ADMIN]: "/dashboard/admin",
    [UserRole.INTAKE_COORDINATOR]: "/dashboard/intake-coordinator",
    [UserRole.SCHEDULER]: "/dashboard/scheduler",
    [UserRole.ACCOUNT_MANAGER]: "/dashboard/account-manager",
    [UserRole.COMMUNITY_DEVELOPMENT_MANAGER]: "/dashboard/community-dev",
    [UserRole.PSYCHOLOGIST]: "/dashboard/psychologist",
    [UserRole.PSYCHOMETRIST]: "/dashboard/psychometrist",
    [UserRole.ABA_PROVIDER_ADMIN]: "/dashboard/aba-provider-admin",
    [UserRole.ABA_PROVIDER_STAFF]: "/dashboard/aba-provider-staff",
    [UserRole.PEDIATRICIAN_ADMIN]: "/dashboard/pediatrician-admin",
    [UserRole.PARENT_GUARDIAN]: "/dashboard/parent-guardian",
  };
  return rolePathMap[role] ?? "/dashboard";
}
