"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@clearpath/ui/components/badge";

export interface PayoutRow {
  id: string;
  status: string;
  amount: string;
  description: string | null;
  paymentRef: string | null;
  paidAt: string | null;
  approvedAt: string | null;
  createdAt: string;
  diagnosticCase: {
    id: string;
    caseNumber: string;
    client: { firstName: string; lastName: string };
  };
}

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "secondary",
  APPROVED: "default",
  PAID: "default",
  VOIDED: "destructive",
};

export const payoutColumns: ColumnDef<PayoutRow>[] = [
  {
    accessorKey: "diagnosticCase.caseNumber",
    header: "Case",
    cell: ({ row }) => row.original.diagnosticCase.caseNumber,
  },
  {
    accessorKey: "diagnosticCase.client",
    header: "Client",
    cell: ({ row }) => {
      const c = row.original.diagnosticCase.client;
      return `${c.firstName} ${c.lastName}`;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.original.description ?? "—",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => `$${Number(row.original.amount).toFixed(2)}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status] ?? "outline"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "paidAt",
    header: "Paid Date",
    cell: ({ row }) =>
      row.original.paidAt
        ? format(new Date(row.original.paidAt), "MMM d, yyyy")
        : "—",
  },
  {
    accessorKey: "paymentRef",
    header: "Payment Ref",
    cell: ({ row }) => row.original.paymentRef ?? "—",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => format(new Date(row.original.createdAt), "MMM d, yyyy"),
  },
];
