"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@clearpath/ui/lib/utils";
import { Button } from "@clearpath/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@clearpath/ui/components/tooltip";
import { useSidebar } from "./sidebar-context";
import { SidebarNav } from "./sidebar-nav";

export function Sidebar() {
  const { data: session } = useSession();
  const activeRole = session?.user?.activeRole;
  const { isCollapsed, toggleCollapsed } = useSidebar();

  if (!activeRole) return null;

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b border-sidebar-border", isCollapsed ? "justify-center px-2" : "px-6")}>
        <Link href="/dashboard" className="text-xl font-bold text-white truncate">
          {isCollapsed ? "CP" : "ClearPath Dx"}
        </Link>
      </div>

      {/* Navigation */}
      <SidebarNav activeRole={activeRole} isCollapsed={isCollapsed} />

      {/* Collapse toggle + version */}
      <div className="border-t border-sidebar-border p-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              className={cn(
                "h-8 w-full text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                isCollapsed && "w-8 mx-auto",
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <div className="flex w-full items-center justify-between px-1">
                  <span className="text-xs">v0.1</span>
                  <ChevronLeft className="h-4 w-4" />
                </div>
              )}
            </Button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  );
}
