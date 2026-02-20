"use client";

import { useCallback, useEffect, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Tabs, TabsList, TabsTrigger } from "@clearpath/ui/components/tabs";
import { DataTable } from "@/components/data-table";
import { orgColumns, type OrgRow } from "./org-columns";

const TYPE_TABS = [
  { value: "", label: "All" },
  { value: "DIAGNOSTICS_OPERATOR", label: "Diagnostics" },
  { value: "ABA_PROVIDER", label: "ABA" },
  { value: "PEDIATRICIAN", label: "Pediatrician" },
  { value: "SCHOOL", label: "School" },
  { value: "BILLING_PROVIDER", label: "Billing" },
];

export function OrgListClient() {
  const [data, setData] = useState<OrgRow[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(pagination.pageIndex + 1));
    params.set("pageSize", String(pagination.pageSize));
    if (typeFilter) params.set("type", typeFilter);
    if (search) params.set("search", search);
    try {
      const res = await fetch(`/api/organizations?${params}`);
      const json = await res.json();
      if (json.success) { setData(json.data); setPageCount(json.pagination.totalPages); }
    } catch (error) { console.error("Failed to fetch organizations:", error); }
    setIsLoading(false);
  }, [pagination.pageIndex, pagination.pageSize, typeFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
              className="w-[250px] pl-9"
            />
          </div>
          <Tabs value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPagination((p) => ({ ...p, pageIndex: 0 })); }}>
            <TabsList>{TYPE_TABS.map((tab) => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}</TabsList>
          </Tabs>
        </div>
        <Button asChild><Link href="/organizations/new"><Plus className="mr-2 h-4 w-4" /> New Organization</Link></Button>
      </div>
      <DataTable columns={orgColumns} data={data} pageCount={pageCount} pagination={pagination} onPaginationChange={setPagination} isLoading={isLoading} />
    </div>
  );
}
