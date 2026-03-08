"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Sheet, SheetContent, SheetTitle } from "@clearpath/ui/components/sheet";
import { useSidebar } from "./sidebar-context";
import { SidebarNav } from "./sidebar-nav";

export function MobileSidebar() {
  const { data: session } = useSession();
  const activeRole = session?.user?.activeRole;
  const { isMobileOpen, setIsMobileOpen } = useSidebar();

  if (!activeRole) return null;

  return (
    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
      <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground [&>button]:text-sidebar-foreground">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <Link
            href="/dashboard"
            className="text-xl font-bold text-white"
            onClick={() => setIsMobileOpen(false)}
          >
            ClearPath Dx
          </Link>
        </div>

        {/* Navigation */}
        <SidebarNav
          activeRole={activeRole}
          isCollapsed={false}
          onNavigate={() => setIsMobileOpen(false)}
        />

        {/* Footer */}
        <div className="border-t border-sidebar-border px-6 py-4">
          <p className="text-xs text-sidebar-foreground/50">ClearPath Dx v0.1</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
