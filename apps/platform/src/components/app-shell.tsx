"use client";

import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@clearpath/ui/components/tooltip";
import { Sidebar } from "./sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { Header } from "./header";
import { SidebarProvider } from "./sidebar-context";
import type { Session } from "next-auth";

interface AppShellProps {
  session: Session;
  children: React.ReactNode;
}

export function AppShell({ session, children }: AppShellProps) {
  return (
    <SessionProvider session={session}>
      <TooltipProvider>
        <SidebarProvider>
          <div className="flex h-screen">
            {/* Desktop sidebar */}
            <div className="hidden md:block">
              <Sidebar />
            </div>
            {/* Mobile sidebar (Sheet) */}
            <MobileSidebar />
            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </SessionProvider>
  );
}
