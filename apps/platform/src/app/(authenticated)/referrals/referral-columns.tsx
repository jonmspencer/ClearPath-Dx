"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@clearpath/ui/components/dropdown-menu";
import { StatusBadge } from "@/components/status-badge";

export type ReferralRow = {
  id: string;
  referralNumber: string;
  status: string;
  channel: string;
  priority: string;
  childFirstName: string;
  childLastName: string;
  receivedAt: string;
  referringOrg: { id: string; name: string };
};

export const referralColumns: ColumnDef<ReferralRow>[] = [
  {
    accessorKey: "referralNumber",
    header: "Ref #",
    cell: ({ row }) => (
      <Link href={`/referrals/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.getValue("referralNumber")}
      </Link>
    ),
  },
  {
    id: "childName",
    header: "Child",
    cell: ({ row }) => `${row.original.childFirstName} ${row.original.childLastName}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} type="referral" />,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => <StatusBadge status={row.getValue("priority")} type="priority" />,
  },
  {
    accessorKey: "channel",
    header: "Channel",
    cell: ({ row }) => (
      <span className="text-sm capitalize">{(row.getValue("channel") as string).toLowerCase().replace("_", " ")}</span>
    ),
  },
  {
    id: "referringOrg",
    header: "Referring Org",
    cell: ({ row }) => row.original.referringOrg?.name ?? "—",
  },
  {
    accessorKey: "receivedAt",
    header: "Received",
    cell: ({ row }) => format(new Date(row.getValue("receivedAt")), "MMM d, yyyy"),
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
            <Link href={`/referrals/${row.original.id}`}>
              <Eye className="mr-2 h-4 w-4" /> View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/referrals/${row.original.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
