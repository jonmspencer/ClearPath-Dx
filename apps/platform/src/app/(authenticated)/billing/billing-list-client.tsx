"use client";

import { useCallback, useEffect, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@clearpath/ui/components/tabs";
import { DataTable } from "@/components/data-table";
import { billingColumns, type BillingRow } from "./billing-columns";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "PAID", label: "Paid" },
  { value: "WRITTEN_OFF", label: "Written Off" },
];

export function BillingListClient() {
  const [data, setData] = useState<BillingRow[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(pagination.pageIndex + 1));
    params.set("pageSize", String(pagination.pageSize));
    if (statusFilter) params.set("status", statusFilter);
    try {
      const res = await fetch(`/api/billing?${params}`);
      const json = await res.json();
      if (json.success) { setData(json.data); setPageCount(json.pagination.totalPages); }
    } catch (error) { console.error("Failed to fetch billing:", error); }
    setIsLoading(false);
  }, [pagination.pageIndex, pagination.pageSize, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPagination((p) => ({ ...p, pageIndex: 0 })); }}>
          <TabsList>{STATUS_TABS.map((tab) => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}</TabsList>
        </Tabs>
        <Button asChild><Link href="/billing/new"><Plus className="mr-2 h-4 w-4" /> New Record</Link></Button>
      </div>
      <DataTable columns={billingColumns} data={data} pageCount={pageCount} pagination={pagination} onPaginationChange={setPagination} isLoading={isLoading} />
    </div>
  );
}
