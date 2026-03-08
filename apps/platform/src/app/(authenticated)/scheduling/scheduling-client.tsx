"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PaginationState } from "@tanstack/react-table";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Tabs, TabsList, TabsTrigger } from "@clearpath/ui/components/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@clearpath/ui/components/select";
import { DataTable } from "@/components/data-table";
import { interviewColumns, type InterviewRow } from "./interview-columns";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "PARENT_INTERVIEW", label: "Parent Interview" },
  { value: "CHILD_OBSERVATION", label: "Child Observation" },
  { value: "SCHOOL_OBSERVATION", label: "School Observation" },
  { value: "TESTING_SESSION", label: "Testing Session" },
  { value: "FEEDBACK_SESSION", label: "Feedback Session" },
];

export function SchedulingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<InterviewRow[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("interviewType") ?? "all");
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
    if (typeFilter && typeFilter !== "all") params.set("interviewType", typeFilter);

    try {
      const res = await fetch(`/api/scheduling/interviews?${params}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setPageCount(json.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch interviews:", error);
    }
    setIsLoading(false);
  }, [pagination.pageIndex, pagination.pageSize, statusFilter, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link href="/scheduling/new">
            <Plus className="mr-2 h-4 w-4" /> New Interview
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
        <TabsList>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        columns={interviewColumns}
        data={data}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />
    </div>
  );
}
