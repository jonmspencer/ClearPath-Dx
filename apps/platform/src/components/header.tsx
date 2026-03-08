"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@clearpath/ui/components/avatar";
import { Button } from "@clearpath/ui/components/button";
import { Separator } from "@clearpath/ui/components/separator";
import { Badge } from "@clearpath/ui/components/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@clearpath/ui/components/breadcrumb";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { useSidebar } from "./sidebar-context";
import { ThemeToggle } from "./theme-toggle";

function getRoleLabel(role: string): string {
  return role
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const { setIsMobileOpen } = useSidebar();
  const crumbs = getBreadcrumbs(pathname);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      {/* Left: hamburger (mobile) + breadcrumbs (desktop) */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:hidden"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>

        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            {crumbs.map((crumb, i) => {
              const isLast = i === crumbs.length - 1;
              return (
                <React.Fragment key={crumb.href}>
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right: theme toggle + role + user info */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {mounted && user && (
          <>
            <Badge variant="secondary" className="hidden font-normal sm:inline-flex">
              {getRoleLabel(user.activeRole)}
            </Badge>

            <Separator orientation="vertical" className="hidden h-6 sm:block" />

            <div className="flex items-center gap-3">
              <Link href="/settings?tab=profile" className="flex items-center gap-3 rounded-md px-2 py-1 transition-colors hover:bg-accent">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium">{user.name ?? user.email}</p>
                  {user.name && (
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  )}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(user.name, user.email)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
              >
                Sign out
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
