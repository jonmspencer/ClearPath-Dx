"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Pencil } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Badge } from "@clearpath/ui/components/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@clearpath/ui/components/dropdown-menu";

export type OrgRow = {
  id: string;
  name: string;
  type: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { members: number; referrals: number; clients: number };
};

const ORG_TYPE_LABELS: Record<string, { label: string; className: string }> = {
  DIAGNOSTICS_OPERATOR: { label: "Diagnostics", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  ABA_PROVIDER: { label: "ABA Provider", className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
  PEDIATRICIAN: { label: "Pediatrician", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  SCHOOL: { label: "School", className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300" },
  BILLING_PROVIDER: { label: "Billing", className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },
};

export const orgColumns: ColumnDef<OrgRow>[] = [
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/organizations/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const config = ORG_TYPE_LABELS[row.original.type];
      return config ? (
        <Badge variant="outline" className={`border-0 font-medium ${config.className}`}>{config.label}</Badge>
      ) : (
        <Badge variant="outline">{row.original.type}</Badge>
      );
    },
  },
  {
    id: "contact",
    header: "Contact",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.email && <div>{row.original.email}</div>}
        {row.original.phone && <div className="text-muted-foreground">{row.original.phone}</div>}
        {!row.original.email && !row.original.phone && <span className="text-muted-foreground">&mdash;</span>}
      </div>
    ),
  },
  {
    id: "location",
    header: "Location",
    cell: ({ row }) => {
      const parts = [row.original.city, row.original.state].filter(Boolean);
      return parts.length > 0 ? parts.join(", ") : <span className="text-muted-foreground">&mdash;</span>;
    },
  },
  {
    id: "members",
    header: "Members",
    cell: ({ row }) => row.original._count.members,
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "secondary"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => format(new Date(row.original.createdAt), "MMM d, yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href={`/organizations/${row.original.id}`}><Eye className="mr-2 h-4 w-4" /> View</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href={`/organizations/${row.original.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> Edit</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
