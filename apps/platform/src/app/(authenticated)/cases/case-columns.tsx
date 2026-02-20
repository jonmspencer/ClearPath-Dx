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

export type CaseRow = {
  id: string;
  caseNumber: string;
  priority: string;
  createdAt: string;
  targetCompletionDate: string | null;
  actualCompletionDate: string | null;
  referral: { id: string; referralNumber: string } | null;
  client: { id: string; firstName: string; lastName: string } | null;
  coordinator: { id: string; name: string } | null;
  psychologist: { id: string; user: { name: string } } | null;
  psychometrist: { id: string; user: { name: string } } | null;
};

export const caseColumns: ColumnDef<CaseRow>[] = [
  {
    accessorKey: "caseNumber",
    header: "Case #",
    cell: ({ row }) => (
      <Link href={`/cases/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.getValue("caseNumber")}
      </Link>
    ),
  },
  {
    id: "clientName",
    header: "Client",
    cell: ({ row }) =>
      row.original.client
        ? `${row.original.client.firstName} ${row.original.client.lastName}`
        : "\u2014",
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => <StatusBadge status={row.getValue("priority")} type="priority" />,
  },
  {
    id: "referral",
    header: "Referral",
    cell: ({ row }) =>
      row.original.referral ? (
        <Link href={`/referrals/${row.original.referral.id}`} className="text-sm text-primary hover:underline">
          {row.original.referral.referralNumber}
        </Link>
      ) : (
        "\u2014"
      ),
  },
  {
    id: "coordinator",
    header: "Coordinator",
    cell: ({ row }) => row.original.coordinator?.name ?? "\u2014",
  },
  {
    id: "psychologist",
    header: "Psychologist",
    cell: ({ row }) => row.original.psychologist?.user?.name ?? "\u2014",
  },
  {
    accessorKey: "targetCompletionDate",
    header: "Target Date",
    cell: ({ row }) => {
      const val = row.getValue("targetCompletionDate") as string | null;
      return val ? format(new Date(val), "MMM d, yyyy") : "\u2014";
    },
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
            <Link href={`/cases/${row.original.id}`}>
              <Eye className="mr-2 h-4 w-4" /> View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/cases/${row.original.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
