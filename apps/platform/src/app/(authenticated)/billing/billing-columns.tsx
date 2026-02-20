"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Pencil } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@clearpath/ui/components/dropdown-menu";
import { StatusBadge } from "@/components/status-badge";

export type BillingRow = {
  id: string;
  status: string;
  cptCode: string | null;
  billedAmount: number | null;
  paidAmount: number | null;
  payerName: string | null;
  claimNumber: string | null;
  createdAt: string;
  diagnosticCase: { id: string; caseNumber: string; client: { firstName: string; lastName: string } };
  organization: { id: string; name: string };
};

export const billingColumns: ColumnDef<BillingRow>[] = [
  {
    id: "caseNumber",
    header: "Case",
    cell: ({ row }) => (
      <Link href={`/billing/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.diagnosticCase.caseNumber}
      </Link>
    ),
  },
  { id: "client", header: "Client", cell: ({ row }) => `${row.original.diagnosticCase.client.firstName} ${row.original.diagnosticCase.client.lastName}` },
  { accessorKey: "cptCode", header: "CPT", cell: ({ row }) => row.getValue("cptCode") || "—" },
  { accessorKey: "billedAmount", header: "Billed", cell: ({ row }) => row.getValue("billedAmount") != null ? `$${Number(row.getValue("billedAmount")).toFixed(2)}` : "—" },
  { accessorKey: "paidAmount", header: "Paid", cell: ({ row }) => row.getValue("paidAmount") != null ? `$${Number(row.getValue("paidAmount")).toFixed(2)}` : "—" },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.getValue("status")} type="billing" /> },
  { accessorKey: "payerName", header: "Payer", cell: ({ row }) => row.getValue("payerName") || "—" },
  { accessorKey: "createdAt", header: "Created", cell: ({ row }) => format(new Date(row.getValue("createdAt")), "MMM d, yyyy") },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href={`/billing/${row.original.id}`}><Eye className="mr-2 h-4 w-4" /> View</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href={`/billing/${row.original.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> Edit</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
