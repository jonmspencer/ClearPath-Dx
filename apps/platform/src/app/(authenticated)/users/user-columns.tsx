"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Pencil } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Badge } from "@clearpath/ui/components/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@clearpath/ui/components/dropdown-menu";

export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  organizationMemberships: {
    id: string;
    role: string;
    isPrimary: boolean;
    organization: { id: string; name: string };
  }[];
  _count: { auditLogs: number };
};

function formatRole(role: string) {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export const userColumns: ColumnDef<UserRow>[] = [
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/users/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.name || "—"}
      </Link>
    ),
  },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Phone", cell: ({ row }) => row.getValue("phone") || "—" },
  {
    id: "organizations",
    header: "Organizations",
    cell: ({ row }) => {
      const orgs = row.original.organizationMemberships;
      if (!orgs.length) return <span className="text-muted-foreground">—</span>;
      const unique = Array.from(new Set(orgs.map((m) => m.organization.name)));
      return (
        <div className="flex flex-wrap gap-1">
          {unique.map((name) => (
            <Badge key={name} variant="secondary" className="text-xs">{name}</Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const memberships = row.original.organizationMemberships;
      if (!memberships.length) return <span className="text-muted-foreground">—</span>;
      const uniqueRoles = Array.from(new Set(memberships.map((m) => m.role)));
      return (
        <div className="flex flex-wrap gap-1">
          {uniqueRoles.map((role) => (
            <Badge key={role} variant="outline" className="text-xs">{formatRole(role)}</Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => (
      <Badge variant={row.getValue("isActive") ? "default" : "secondary"} className="text-xs">
        {row.getValue("isActive") ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  { accessorKey: "createdAt", header: "Created", cell: ({ row }) => format(new Date(row.getValue("createdAt")), "MMM d, yyyy") },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href={`/users/${row.original.id}`}><Eye className="mr-2 h-4 w-4" /> View</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href={`/users/${row.original.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> Edit</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
