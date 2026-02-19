"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Users, Calendar, ClipboardCheck,
  DollarSign, Activity, Building2, UserCog, Shield, Settings,
} from "lucide-react";
import { cn } from "@clearpath/ui/lib/utils";
import { getNavigationForRole, type NavItem } from "@clearpath/rbac";
import type { UserRole } from "@clearpath/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  FileText,
  Users,
  Calendar,
  ClipboardCheck,
  DollarSign,
  Activity,
  Building2,
  UserCog,
  Shield,
  Settings,
};

interface SidebarProps {
  activeRole: UserRole;
}

export function Sidebar({ activeRole }: SidebarProps) {
  const pathname = usePathname();
  const navItems = getNavigationForRole(activeRole);

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="text-xl font-bold text-white">
          ClearPath Dx
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-6 py-4">
        <p className="text-xs text-sidebar-foreground/50">
          ClearPath Dx v0.1
        </p>
      </div>
    </aside>
  );
}
