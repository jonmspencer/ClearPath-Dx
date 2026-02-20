"use client";

import { useCallback, useEffect, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Tabs, TabsList, TabsTrigger } from "@clearpath/ui/components/tabs";
import { DataTable } from "@/components/data-table";
import { providerColumns, type ProviderRow } from "./provider-columns";

const TYPE_TABS = [
  { value: "", label: "All" },
  { value: "PSYCHOLOGIST", label: "Psychologist" },
  { value: "PSYCHOMETRIST", label: "Psychometrist" },
];

export function ProviderListClient() {
  const [data, setData] = useState<ProviderRow[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(pagination.pageIndex + 1));
    params.set("pageSize", String(pagination.pageSize));
    if (typeFilter) params.set("providerType", typeFilter);
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/providers?${params}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setPageCount(json.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch providers:", error);
    }
    setIsLoading(false);
  }, [pagination.pageIndex, pagination.pageSize, typeFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search providers..."
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
          <Link href="/providers/new">
            <Plus className="mr-2 h-4 w-4" /> New Provider
          </Link>
        </Button>
      </div>

      <Tabs
        value={typeFilter}
        onValueChange={(v) => {
          setTypeFilter(v);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
      >
        <TabsList>
          {TYPE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        columns={providerColumns}
        data={data}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />
    </div>
  );
}
