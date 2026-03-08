"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import type { PaginationState } from "@tanstack/react-table";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Tabs, TabsList, TabsTrigger } from "@clearpath/ui/components/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@clearpath/ui/components/dialog";
import { ScrollArea } from "@clearpath/ui/components/scroll-area";
import { DataTable } from "@/components/data-table";
import { createAuditLogColumns, ActionBadge, type AuditLogRow } from "./audit-log-columns";

const ACTION_TABS = [
  { value: "", label: "All" },
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "READ_PHI", label: "Read PHI" },
  { value: "EXPORT", label: "Export" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "PERMISSION_CHANGE", label: "Permission Change" },
];

export function AuditLogClient() {
  const [data, setData] = useState<AuditLogRow[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });
  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(pagination.pageIndex + 1));
    params.set("pageSize", String(pagination.pageSize));
    if (actionFilter) params.set("action", actionFilter);
    if (search) params.set("search", search);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    try {
      const res = await fetch(`/api/audit-log?${params}`);
      const json = await res.json();
      if (json.success) { setData(json.data); setPageCount(json.pagination.totalPages); }
    } catch (error) { console.error("Failed to fetch audit logs:", error); }
    setIsLoading(false);
  }, [pagination.pageIndex, pagination.pageSize, actionFilter, search, dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = useMemo(() => createAuditLogColumns(setSelectedLog), []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPagination((p) => ({ ...p, pageIndex: 0 })); }}>
          <TabsList className="flex-wrap">
            {ACTION_TABS.map((tab) => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}
          </TabsList>
        </Tabs>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resource or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => { if (e.key === "Enter") { setPagination((p) => ({ ...p, pageIndex: 0 })); } }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[160px]" />
          <span className="text-sm text-muted-foreground">to</span>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[160px]" />
        </div>
        <Button variant="outline" size="sm" onClick={() => { setPagination((p) => ({ ...p, pageIndex: 0 })); }}>
          Apply
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); setActionFilter(""); setPagination({ pageIndex: 0, pageSize: 25 }); }}>
          Clear
        </Button>
      </div>
      <DataTable columns={columns} data={data} pageCount={pageCount} pagination={pagination} onPaginationChange={setPagination} isLoading={isLoading} />

      <Dialog open={!!selectedLog} onOpenChange={(open) => { if (!open) setSelectedLog(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Detail</DialogTitle>
            <DialogDescription>
              {selectedLog && format(new Date(selectedLog.createdAt), "MMM d, yyyy HH:mm:ss")}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Actor</span>
                  <p className="font-medium">{selectedLog.actor?.name || selectedLog.actor?.email || "System"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Action</span>
                  <div className="mt-0.5"><ActionBadge action={selectedLog.action} /></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Resource</span>
                  <p className="font-medium">{selectedLog.resource}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Resource ID</span>
                  <p className="font-mono text-xs">{selectedLog.resourceId || "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">IP Address</span>
                  <p className="font-mono text-xs">{selectedLog.ipAddress || "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">User Agent</span>
                  <p className="text-xs truncate">{selectedLog.userAgent || "—"}</p>
                </div>
              </div>
              {selectedLog.oldValues != null && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Old Values</h4>
                  <ScrollArea className="h-[150px] rounded-md border p-3">
                    <pre className="text-xs">{JSON.stringify(selectedLog.oldValues, null, 2)}</pre>
                  </ScrollArea>
                </div>
              )}
              {selectedLog.newValues != null && (
                <div>
                  <h4 className="text-sm font-medium mb-1">New Values</h4>
                  <ScrollArea className="h-[150px] rounded-md border p-3">
                    <pre className="text-xs">{JSON.stringify(selectedLog.newValues, null, 2)}</pre>
                  </ScrollArea>
                </div>
              )}
              {selectedLog.metadata != null && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Metadata</h4>
                  <ScrollArea className="h-[150px] rounded-md border p-3">
                    <pre className="text-xs">{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
