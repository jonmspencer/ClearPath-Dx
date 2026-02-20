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
import { StatusBadge } from "@/components/status-badge";

export type ReportRow = {
  id: string;
  status: string;
  summary: string | null;
  diagnoses: string[];
  submittedAt: string | null;
  createdAt: string;
  diagnosticCase: { id: string; caseNumber: string; client: { firstName: string; lastName: string } };
  author: { id: string; user: { name: string | null } };
};

export const reportColumns: ColumnDef<ReportRow>[] = [
  {
    id: "caseNumber",
    header: "Case",
    cell: ({ row }) => (
      <Link href={`/reports/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.diagnosticCase.caseNumber}
      </Link>
    ),
  },
  {
    id: "client",
    header: "Client",
    cell: ({ row }) =>
      `${row.original.diagnosticCase.client.firstName} ${row.original.diagnosticCase.client.lastName}`,
  },
  {
    id: "author",
    header: "Author",
    cell: ({ row }) => row.original.author.user.name ?? "—",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} type="report" />,
  },
  {
    id: "diagnoses",
    header: "Diagnoses",
    cell: ({ row }) => row.original.diagnoses?.join(", ") || "—",
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
            <Link href={`/reports/${row.original.id}`}><Eye className="mr-2 h-4 w-4" /> View</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/reports/${row.original.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> Edit</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
