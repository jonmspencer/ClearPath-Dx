"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Badge } from "@clearpath/ui/components/badge";
import { Button } from "@clearpath/ui/components/button";
import { cn } from "@clearpath/ui/lib/utils";

export type AuditLogRow = {
  id: string;
  actorId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  oldValues: unknown;
  newValues: unknown;
  metadata: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  actor: { id: string; name: string | null; email: string } | null;
};

const ACTION_CONFIG: Record<string, { label: string; className: string }> = {
  CREATE: { label: "Create", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  UPDATE: { label: "Update", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  DELETE: { label: "Delete", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  READ_PHI: { label: "Read PHI", className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
  EXPORT: { label: "Export", className: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300" },
  LOGIN: { label: "Login", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300" },
  LOGOUT: { label: "Logout", className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },
  PERMISSION_CHANGE: { label: "Permission Change", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
};

export function ActionBadge({ action }: { action: string }) {
  const config = ACTION_CONFIG[action];
  if (!config) return <Badge variant="outline">{action}</Badge>;
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}

export function createAuditLogColumns(onViewDetail: (row: AuditLogRow) => void): ColumnDef<AuditLogRow>[] {
  return [
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }) => format(new Date(row.getValue("createdAt")), "MMM d, yyyy HH:mm:ss"),
    },
    {
      id: "actor",
      header: "Actor",
      cell: ({ row }) => row.original.actor?.name || row.original.actor?.email || "System",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => <ActionBadge action={row.getValue("action")} />,
    },
    {
      accessorKey: "resource",
      header: "Resource",
      cell: ({ row }) => <span className="font-medium">{row.getValue("resource")}</span>,
    },
    {
      accessorKey: "resourceId",
      header: "Resource ID",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.getValue("resourceId") || "—"}</span>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.getValue("ipAddress") || "—"}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => onViewDetail(row.original)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];
}
