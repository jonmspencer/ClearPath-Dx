"use client";

import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@clearpath/ui/components/avatar";
import { Button } from "@clearpath/ui/components/button";
import { Separator } from "@clearpath/ui/components/separator";
import { Badge } from "@clearpath/ui/components/badge";
import type { SessionUser } from "@clearpath/types";

interface HeaderProps {
  user: SessionUser;
}

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

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div />

      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="font-normal">
          {getRoleLabel(user.activeRole)}
        </Badge>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-3">
          <div className="text-right">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
