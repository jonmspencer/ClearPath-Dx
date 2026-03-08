"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Pencil } from "lucide-react";
import { Badge } from "@clearpath/ui/components/badge";
import { Button } from "@clearpath/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@clearpath/ui/components/dropdown-menu";

export type ProviderRow = {
  id: string;
  providerType: string;
  licenseNumber: string | null;
  maxWeeklyCases: number;
  currentWeeklyCases: number;
  isAcceptingCases: boolean;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  organization: { id: string; name: string };
};

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  PSYCHOLOGIST: { label: "Psychologist", className: "bg-purple-100 text-purple-800 border-0" },
  PSYCHOMETRIST: { label: "Psychometrist", className: "bg-blue-100 text-blue-800 border-0" },
};

export const providerColumns: ColumnDef<ProviderRow>[] = [
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/providers/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.user.name ?? row.original.user.email}
      </Link>
    ),
  },
  {
    id: "providerType",
    header: "Type",
    cell: ({ row }) => {
      const config = TYPE_BADGE[row.original.providerType];
      return config ? (
        <Badge variant="outline" className={config.className}>{config.label}</Badge>
      ) : (
        <Badge variant="outline">{row.original.providerType}</Badge>
      );
    },
  },
  {
    id: "organization",
    header: "Organization",
    cell: ({ row }) => row.original.organization.name,
  },
  {
    accessorKey: "licenseNumber",
    header: "License #",
    cell: ({ row }) => row.getValue("licenseNumber") || "\u2014",
  },
  {
    id: "capacity",
    header: "Capacity",
    cell: ({ row }) => `${row.original.currentWeeklyCases}/${row.original.maxWeeklyCases}`,
  },
  {
    id: "acceptingCases",
    header: "Accepting Cases",
    cell: ({ row }) => (
      <Badge variant="outline" className={row.original.isAcceptingCases ? "bg-green-100 text-green-800 border-0" : "bg-gray-100 text-gray-600 border-0"}>
        {row.original.isAcceptingCases ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => format(new Date(row.getValue("createdAt")), "MMM d, yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href={`/providers/${row.original.id}`}><Eye className="mr-2 h-4 w-4" /> View</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href={`/providers/${row.original.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> Edit</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
