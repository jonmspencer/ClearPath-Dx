"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, MessageSquare, ArrowRight, Search, Mail, Clock } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Badge } from "@clearpath/ui/components/badge";
import { Tabs, TabsList, TabsTrigger } from "@clearpath/ui/components/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@clearpath/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@clearpath/ui/components/dialog";
import { Textarea } from "@clearpath/ui/components/textarea";
import { toast } from "sonner";

interface OutreachLog {
  id: string;
  channel: string;
  status: string;
  sentAt: string;
  respondedAt: string | null;
  response: string | null;
  attemptNumber: number;
}

interface Guardian {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
}

interface QueueItem {
  id: string;
  referralNumber: string;
  status: string;
  priority: string;
  childFirstName: string;
  childLastName: string;
  receivedAt: string;
  referringOrg: { id: string; name: string };
  client: {
    guardians: Guardian[];
  } | null;
  outreachLogs: OutreachLog[];
  diagnosticCase: {
    id: string;
    caseNumber: string;
    coordinator: { id: string; name: string } | null;
  } | null;
}

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "RECEIVED", label: "Received" },
  { value: "INTAKE_IN_PROGRESS", label: "In Progress" },
  { value: "PARENT_CONTACTED", label: "Contacted" },
];

function statusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "RECEIVED": return "destructive";
    case "INTAKE_IN_PROGRESS": return "default";
    case "PARENT_CONTACTED": return "secondary";
    default: return "outline";
  }
}

function priorityBadge(priority: string) {
  if (priority === "URGENT") return <Badge variant="destructive">Urgent</Badge>;
  if (priority === "EXPEDITED") return <Badge variant="default">Expedited</Badge>;
  return null;
}

function timeSince(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function CoordinatorQueueClient() {
  const router = useRouter();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [callNoteReferralId, setCallNoteReferralId] = useState<string | null>(null);
  const [callNote, setCallNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/coordinator-queue?${params}`);
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      toast.error("Failed to load queue");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleAction(referralId: string, action: string, note?: string) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/coordinator-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralId, action, note }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || "Action completed");
        fetchData();
      } else {
        toast.error(json.error || "Action failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsSubmitting(false);
      setCallNoteReferralId(null);
      setCallNote("");
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or referral #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Summary */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "referral" : "referrals"} in queue
        </p>
      )}

      {/* Queue Items */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Loading queue...
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            No referrals in queue. All caught up!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const guardian = item.client?.guardians?.[0];
            const lastOutreach = item.outreachLogs[0];
            const attemptCount = item.outreachLogs.length;
            const hasResponded = item.outreachLogs.some((l) => l.status === "RESPONDED");

            return (
              <Card key={item.id} className={item.priority === "URGENT" ? "border-red-300" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">
                        {item.childFirstName} {item.childLastName}
                      </CardTitle>
                      <Badge variant={statusBadgeVariant(item.status)}>
                        {item.status.replace(/_/g, " ")}
                      </Badge>
                      {priorityBadge(item.priority)}
                    </div>
                    <span className="text-sm text-muted-foreground font-mono">
                      {item.referralNumber}
                    </span>
                  </div>
                  <CardDescription>
                    From {item.referringOrg.name} &middot; Received {timeSince(item.receivedAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    {/* Guardian Info */}
                    <div className="space-y-1 text-sm">
                      {guardian ? (
                        <>
                          <p className="font-medium">
                            {guardian.firstName} {guardian.lastName}
                          </p>
                          {guardian.phone && (
                            <p className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {guardian.phone}
                            </p>
                          )}
                          {guardian.email && (
                            <p className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {guardian.email}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground">No guardian on file</p>
                      )}

                      {/* Outreach Status */}
                      <div className="flex items-center gap-2 pt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {attemptCount === 0 ? (
                          <span className="text-muted-foreground">No outreach yet</span>
                        ) : hasResponded ? (
                          <span className="text-green-600 font-medium">Parent responded</span>
                        ) : (
                          <span className="text-muted-foreground">
                            {attemptCount} attempt{attemptCount !== 1 ? "s" : ""} &middot;
                            Last {lastOutreach ? timeSince(lastOutreach.sentAt) : "unknown"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Dialog
                        open={callNoteReferralId === item.id}
                        onOpenChange={(open) => {
                          if (!open) setCallNoteReferralId(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCallNoteReferralId(item.id)}
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            Log Call
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Log Phone Call</DialogTitle>
                            <DialogDescription>
                              Record a call attempt for {item.childFirstName} {item.childLastName}
                            </DialogDescription>
                          </DialogHeader>
                          <Textarea
                            placeholder="Call notes (optional — leave blank for unanswered call)"
                            value={callNote}
                            onChange={(e) => setCallNote(e.target.value)}
                          />
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setCallNoteReferralId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              disabled={isSubmitting}
                              onClick={() => handleAction(item.id, "LOG_CALL", callNote)}
                            >
                              {isSubmitting ? "Saving..." : "Save"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="default"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() => handleAction(item.id, "ADVANCE_STATUS")}
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Next Stage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
