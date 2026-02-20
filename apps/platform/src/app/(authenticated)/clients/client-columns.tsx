"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Pencil } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@clearpath/ui/components/dropdown-menu";
import { Badge } from "@clearpath/ui/components/badge";

export type ClientRow = {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  dateOfBirth: string;
  schoolName: string | null;
  grade: string | null;
  createdAt: string;
  referringOrg: { id: string; name: string };
  referral: { id: string; referralNumber: string };
  guardians: { id: string; firstName: string; lastName: string; isPrimary: boolean }[];
  _count: { diagnosticCases: number; careFlags: number };
};

export const clientColumns: ColumnDef<ClientRow>[] = [
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/clients/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.firstName} {row.original.lastName}
        {row.original.preferredName && (
          <span className="ml-1 text-muted-foreground">({row.original.preferredName})</span>
        )}
      </Link>
    ),
  },
  {
    accessorKey: "dateOfBirth",
    header: "Date of Birth",
    cell: ({ row }) => format(new Date(row.getValue("dateOfBirth")), "MMM d, yyyy"),
  },
  {
    id: "school",
    header: "School / Grade",
    cell: ({ row }) => {
      const parts = [row.original.schoolName, row.original.grade].filter(Boolean);
      return parts.length > 0 ? parts.join(" - ") : "---";
    },
  },
  {
    id: "primaryGuardian",
    header: "Primary Guardian",
    cell: ({ row }) => {
      const primary = row.original.guardians.find((g) => g.isPrimary);
      return primary ? `${primary.firstName} ${primary.lastName}` : "---";
    },
  },
  {
    id: "referringOrg",
    header: "Referring Org",
    cell: ({ row }) => row.original.referringOrg?.name ?? "---",
  },
  {
    id: "cases",
    header: "Cases",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original._count.diagnosticCases}</Badge>
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
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/clients/${row.original.id}`}>
              <Eye className="mr-2 h-4 w-4" /> View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/clients/${row.original.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
