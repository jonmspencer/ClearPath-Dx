"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Pencil } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Badge } from "@clearpath/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@clearpath/ui/components/dropdown-menu";

const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  PARENT_INTERVIEW: "Parent Interview",
  CHILD_OBSERVATION: "Child Observation",
  SCHOOL_OBSERVATION: "School Observation",
  TESTING_SESSION: "Testing Session",
  FEEDBACK_SESSION: "Feedback Session",
};

export type InterviewRow = {
  id: string;
  interviewType: string;
  scheduledStart: string;
  scheduledEnd: string;
  isCompleted: boolean;
  isCancelled: boolean;
  location: string | null;
  case: {
    id: string;
    caseNumber: string;
    client: { id: string; firstName: string; lastName: string } | null;
  } | null;
  provider: {
    id: string;
    user: { id: string; name: string };
  } | null;
};

function InterviewStatusBadge({ isCompleted, isCancelled }: { isCompleted: boolean; isCancelled: boolean }) {
  if (isCancelled) {
    return (
      <Badge variant="outline" className="border-0 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
        Cancelled
      </Badge>
    );
  }
  if (isCompleted) {
    return (
      <Badge variant="outline" className="border-0 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
        Completed
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-0 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
      Scheduled
    </Badge>
  );
}

export const interviewColumns: ColumnDef<InterviewRow>[] = [
  {
    id: "case",
    header: "Case",
    cell: ({ row }) =>
      row.original.case ? (
        <Link href={`/cases/${row.original.case.id}`} className="font-medium text-primary hover:underline">
          {row.original.case.caseNumber}
        </Link>
      ) : (
        "\u2014"
      ),
  },
  {
    id: "client",
    header: "Client",
    cell: ({ row }) =>
      row.original.case?.client
        ? `${row.original.case.client.firstName} ${row.original.case.client.lastName}`
        : "\u2014",
  },
  {
    accessorKey: "interviewType",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-sm">
        {INTERVIEW_TYPE_LABELS[row.getValue("interviewType") as string] ?? row.getValue("interviewType")}
      </span>
    ),
  },
  {
    id: "provider",
    header: "Provider",
    cell: ({ row }) => row.original.provider?.user?.name ?? "\u2014",
  },
  {
    accessorKey: "scheduledStart",
    header: "Date & Time",
    cell: ({ row }) => {
      const start = new Date(row.getValue("scheduledStart") as string);
      const end = new Date(row.original.scheduledEnd);
      return (
        <div className="text-sm">
          <p>{format(start, "MMM d, yyyy")}</p>
          <p className="text-muted-foreground">
            {format(start, "h:mm a")} - {format(end, "h:mm a")}
          </p>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <InterviewStatusBadge
        isCompleted={row.original.isCompleted}
        isCancelled={row.original.isCancelled}
      />
    ),
  },
  {
    id: "location",
    header: "Location",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.location ?? "\u2014"}</span>
    ),
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
            <Link href={`/scheduling/${row.original.id}`}>
              <Eye className="mr-2 h-4 w-4" /> View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/scheduling/${row.original.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
