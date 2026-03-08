"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Users, Calendar, ClipboardCheck,
  DollarSign, Activity, Building2, UserCog, Shield, Settings,
  Briefcase, ChevronDown, ListChecks, Wallet,
} from "lucide-react";
import { cn } from "@clearpath/ui/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@clearpath/ui/components/tooltip";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@clearpath/ui/components/collapsible";
import { getGroupedNavigationForRole, type NavItem } from "@clearpath/rbac";
import type { UserRole } from "@clearpath/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, FileText, Users, Calendar, ClipboardCheck,
  DollarSign, Activity, Building2, UserCog, Shield, Settings, Briefcase,
  ListChecks, Wallet,
};

interface SidebarNavProps {
  activeRole: UserRole;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarNav({ activeRole, isCollapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const groups = getGroupedNavigationForRole(activeRole);

  return (
    <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
      {groups.map((group) => {
        if (!group.label) {
          // Ungrouped items (Dashboard)
          return group.items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              isCollapsed={isCollapsed}
              onNavigate={onNavigate}
            />
          ));
        }

        if (isCollapsed) {
          // When collapsed, show items without group headers
          return group.items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              }
              isCollapsed={isCollapsed}
              onNavigate={onNavigate}
            />
          ));
        }

        return (
          <Collapsible key={group.label} defaultOpen className="space-y-1">
            <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground/70">
              <span>{group.label}</span>
              <ChevronDown className="h-3 w-3 transition-transform duration-200 [[data-state=closed]>&]:rotate-[-90deg]" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href))
                  }
                  isCollapsed={false}
                  onNavigate={onNavigate}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </nav>
  );
}

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onNavigate?: () => void;
}

function NavLink({ item, isActive, isCollapsed, onNavigate }: NavLinkProps) {
  const Icon = ICON_MAP[item.icon];

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isCollapsed && "justify-center px-2",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {!isCollapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}
