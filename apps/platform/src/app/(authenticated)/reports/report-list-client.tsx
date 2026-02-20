"use client";

import { useCallback, useEffect, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Tabs, TabsList, TabsTrigger } from "@clearpath/ui/components/tabs";
import { DataTable } from "@/components/data-table";
import { reportColumns, type ReportRow } from "./report-columns";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "REVISION_REQUESTED", label: "Revision" },
  { value: "APPROVED", label: "Approved" },
  { value: "DELIVERED", label: "Delivered" },
];

export function ReportListClient() {
  const [data, setData] = useState<ReportRow[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(pagination.pageIndex + 1));
    params.set("pageSize", String(pagination.pageSize));
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/reports?${params}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setPageCount(json.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
    setIsLoading(false);
  }, [pagination.pageIndex, pagination.pageSize, statusFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search reports..." value={search} onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, pageIndex: 0 })); }} className="w-[250px] pl-9" />
        </div>
        <Button asChild><Link href="/reports/new"><Plus className="mr-2 h-4 w-4" /> New Report</Link></Button>
      </div>
      <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPagination((p) => ({ ...p, pageIndex: 0 })); }}>
        <TabsList>{STATUS_TABS.map((tab) => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}</TabsList>
      </Tabs>
      <DataTable columns={reportColumns} data={data} pageCount={pageCount} pagination={pagination} onPaginationChange={setPagination} isLoading={isLoading} />
    </div>
  );
}
