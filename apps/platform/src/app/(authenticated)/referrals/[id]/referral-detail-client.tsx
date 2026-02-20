"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { Pencil, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Badge } from "@clearpath/ui/components/badge";
import { Separator } from "@clearpath/ui/components/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@clearpath/ui/components/select";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";

const STATUS_ORDER = [
  "RECEIVED", "INTAKE_IN_PROGRESS", "PARENT_CONTACTED", "READY_TO_SCHEDULE",
  "INTERVIEW_SCHEDULED", "INTERVIEW_COMPLETED", "REPORT_IN_REVIEW",
  "REPORT_APPROVED", "BILLING_SUBMITTED", "DIAGNOSIS_COMPLETE",
  "REPORT_DELIVERED", "CLOSED",
];

interface ReferralDetailProps {
  referral: any;
}

export function ReferralDetailClient({ referral }: ReferralDetailProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const currentIdx = STATUS_ORDER.indexOf(referral.status);
  const nextStatuses = STATUS_ORDER.slice(currentIdx + 1);

  async function advanceStatus(newStatus: string) {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/referrals/${referral.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Status updated to ${newStatus.replace(/_/g, " ").toLowerCase()}`);
        router.refresh();
      } else {
        toast.error(json.error || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    }
    setIsUpdating(false);
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/referrals/${referral.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Referral deleted");
        router.push("/referrals");
      } else {
        toast.error(json.error || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href={`/referrals/${referral.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Link>
        </Button>
        {nextStatuses.length > 0 && referral.status !== "CLOSED" && (
          <Select onValueChange={advanceStatus} disabled={isUpdating}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Advance status..." />
            </SelectTrigger>
            <SelectContent>
              {nextStatuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="flex-1" />
        <ConfirmDialog
          title="Delete Referral"
          description="Are you sure you want to delete this referral? This action cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDelete}
        >
          <Button variant="outline" size="sm" className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </ConfirmDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Referral Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Referral Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Referral #" value={referral.referralNumber} />
            <InfoRow label="Status">
              <StatusBadge status={referral.status} type="referral" />
            </InfoRow>
            <InfoRow label="Priority">
              <StatusBadge status={referral.priority} type="priority" />
            </InfoRow>
            <InfoRow label="Channel" value={referral.channel.replace(/_/g, " ")} />
            <InfoRow label="Referring Org" value={referral.referringOrg?.name} />
            <InfoRow label="Source" value={referral.referralSource?.label ?? "—"} />
            <InfoRow label="Received" value={format(new Date(referral.receivedAt), "MMM d, yyyy h:mm a")} />
          </CardContent>
        </Card>

        {/* Child Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Child Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Name" value={`${referral.childFirstName} ${referral.childLastName}`} />
            <InfoRow label="Date of Birth" value={referral.childDateOfBirth ? format(new Date(referral.childDateOfBirth), "MMM d, yyyy") : "—"} />
            <InfoRow label="Age" value={referral.childAge ? `${referral.childAge} years` : "—"} />
            <InfoRow label="Insurance" value={referral.insuranceInfo ?? "—"} />
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Reason for Referral</p>
              <p className="mt-1 text-sm">{referral.reasonForReferral || "—"}</p>
            </div>
            {referral.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="mt-1 text-sm">{referral.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Linked Records */}
      {(referral.client || referral.diagnosticCase) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Linked Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {referral.client && (
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Client: {referral.client.firstName} {referral.client.lastName}</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/clients/${referral.client.id}`}>
                    View <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
            {referral.diagnosticCase && (
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Case: {referral.diagnosticCase.caseNumber}</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/cases/${referral.diagnosticCase.id}`}>
                    View <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status History</CardTitle>
        </CardHeader>
        <CardContent>
          {referral.statusHistory?.length > 0 ? (
            <div className="space-y-3">
              {referral.statusHistory.map((entry: any, i: number) => (
                <div key={entry.id} className="flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {entry.fromStatus && (
                        <>
                          <StatusBadge status={entry.fromStatus} type="referral" />
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        </>
                      )}
                      <StatusBadge status={entry.toStatus} type="referral" />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {format(new Date(entry.changedAt), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No status history recorded.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children || <span className="text-sm font-medium">{value ?? "—"}</span>}
    </div>
  );
}
