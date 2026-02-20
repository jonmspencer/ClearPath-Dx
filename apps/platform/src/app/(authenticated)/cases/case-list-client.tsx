"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PaginationState } from "@tanstack/react-table";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Tabs, TabsList, TabsTrigger } from "@clearpath/ui/components/tabs";
import { DataTable } from "@/components/data-table";
import { caseColumns, type CaseRow } from "./case-columns";

const PRIORITY_TABS = [
  { value: "", label: "All" },
  { value: "STANDARD", label: "Standard" },
  { value: "URGENT", label: "Urgent" },
  { value: "EXPEDITED", label: "Expedited" },
];

export function CaseListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<CaseRow[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get("priority") ?? "");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: parseInt(searchParams.get("page") ?? "1") - 1,
    pageSize: 25,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(pagination.pageIndex + 1));
    params.set("pageSize", String(pagination.pageSize));
    if (priorityFilter) params.set("priority", priorityFilter);
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/cases?${params}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setPageCount(json.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch cases:", error);
    }
    setIsLoading(false);
  }, [pagination.pageIndex, pagination.pageSize, priorityFilter, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
              className="w-[250px] pl-9"
            />
          </div>
        </div>
        <Button asChild>
          <Link href="/cases/new">
            <Plus className="mr-2 h-4 w-4" /> New Case
          </Link>
        </Button>
      </div>

      <Tabs
        value={priorityFilter}
        onValueChange={(v) => {
          setPriorityFilter(v);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
      >
        <TabsList>
          {PRIORITY_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        columns={caseColumns}
        data={data}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />
    </div>
  );
}
