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
import { referralColumns, type ReferralRow } from "./referral-columns";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "RECEIVED", label: "Received" },
  { value: "INTAKE_IN_PROGRESS", label: "Intake" },
  { value: "PARENT_CONTACTED", label: "Contacted" },
  { value: "READY_TO_SCHEDULE", label: "Ready" },
  { value: "INTERVIEW_SCHEDULED", label: "Scheduled" },
  { value: "INTERVIEW_COMPLETED", label: "Completed" },
  { value: "REPORT_IN_REVIEW", label: "In Review" },
  { value: "CLOSED", label: "Closed" },
];

export function ReferralListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<ReferralRow[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: parseInt(searchParams.get("page") ?? "1") - 1,
    pageSize: 25,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(pagination.pageIndex + 1));
    params.set("pageSize", String(pagination.pageSize));
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/referrals?${params}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setPageCount(json.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch referrals:", error);
    }
    setIsLoading(false);
  }, [pagination.pageIndex, pagination.pageSize, statusFilter, search]);

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
              placeholder="Search referrals..."
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
          <Link href="/referrals/new">
            <Plus className="mr-2 h-4 w-4" /> New Referral
          </Link>
        </Button>
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={(v) => {
          setStatusFilter(v);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
      >
        <TabsList className="flex-wrap">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        columns={referralColumns}
        data={data}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />
    </div>
  );
}
