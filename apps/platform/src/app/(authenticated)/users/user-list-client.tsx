"use client";

import { useCallback, useEffect, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Tabs, TabsList, TabsTrigger } from "@clearpath/ui/components/tabs";
import { DataTable } from "@/components/data-table";
import { userColumns, type UserRow } from "./user-columns";

const ACTIVE_TABS = [
  { value: "", label: "All" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export function UserListClient() {
  const [data, setData] = useState<UserRow[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(pagination.pageIndex + 1));
    params.set("pageSize", String(pagination.pageSize));
    if (activeFilter) params.set("active", activeFilter);
    if (search) params.set("search", search);
    try {
      const res = await fetch(`/api/users?${params}`);
      const json = await res.json();
      if (json.success) { setData(json.data); setPageCount(json.pagination.totalPages); }
    } catch (error) { console.error("Failed to fetch users:", error); }
    setIsLoading(false);
  }, [pagination.pageIndex, pagination.pageSize, activeFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, pageIndex: 0 })); }}
              className="w-[300px] pl-9"
            />
          </div>
          <Tabs value={activeFilter} onValueChange={(v) => { setActiveFilter(v); setPagination((p) => ({ ...p, pageIndex: 0 })); }}>
            <TabsList>{ACTIVE_TABS.map((tab) => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}</TabsList>
          </Tabs>
        </div>
        <Button asChild><Link href="/users/new"><Plus className="mr-2 h-4 w-4" /> New User</Link></Button>
      </div>
      <DataTable columns={userColumns} data={data} pageCount={pageCount} pagination={pagination} onPaginationChange={setPagination} isLoading={isLoading} />
    </div>
  );
}
