"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { Pencil, ArrowRight, Trash2, Users, Calendar } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Badge } from "@clearpath/ui/components/badge";
import { Separator } from "@clearpath/ui/components/separator";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";

const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  PARENT_INTERVIEW: "Parent Interview",
  CHILD_OBSERVATION: "Child Observation",
  SCHOOL_OBSERVATION: "School Observation",
  TESTING_SESSION: "Testing Session",
  FEEDBACK_SESSION: "Feedback Session",
};

interface CaseDetailProps {
  diagnosticCase: any;
}

export function CaseDetailClient({ diagnosticCase }: CaseDetailProps) {
  const router = useRouter();

  async function handleDelete() {
    try {
      const res = await fetch(`/api/cases/${diagnosticCase.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Case deleted");
        router.push("/cases");
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
          <Link href={`/cases/${diagnosticCase.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/scheduling/new?caseId=${diagnosticCase.id}`}>
            <Calendar className="mr-2 h-4 w-4" /> Schedule Interview
          </Link>
        </Button>
        <div className="flex-1" />
        <ConfirmDialog
          title="Delete Case"
          description="Are you sure you want to delete this diagnostic case? This action cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDelete}
        >
          <Button variant="outline" size="sm" className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </ConfirmDialog>
      </div>

      {/* Active Care Flags */}
      {diagnosticCase.careFlags?.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Active Care Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {diagnosticCase.careFlags.map((flag: any) => (
              <div key={flag.id} className="flex items-start gap-2 rounded-md border p-3">
                <StatusBadge status={flag.severity} type="flag" />
                <p className="text-sm">{flag.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Case Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Case Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Case #" value={diagnosticCase.caseNumber} />
            <InfoRow label="Priority">
              <StatusBadge status={diagnosticCase.priority} type="priority" />
            </InfoRow>
            <InfoRow
              label="Target Completion"
              value={
                diagnosticCase.targetCompletionDate
                  ? format(new Date(diagnosticCase.targetCompletionDate), "MMM d, yyyy")
                  : undefined
              }
            />
            <InfoRow
              label="Actual Completion"
              value={
                diagnosticCase.actualCompletionDate
                  ? format(new Date(diagnosticCase.actualCompletionDate), "MMM d, yyyy")
                  : undefined
              }
            />
            <InfoRow
              label="Created"
              value={format(new Date(diagnosticCase.createdAt), "MMM d, yyyy h:mm a")}
            />
            {diagnosticCase.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm">{diagnosticCase.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Assigned Team */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Assigned Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              label="Coordinator"
              value={diagnosticCase.coordinator?.name}
            />
            <InfoRow
              label="Scheduler"
              value={diagnosticCase.scheduler?.name}
            />
            <InfoRow
              label="Psychologist"
              value={diagnosticCase.psychologist?.user?.name}
            />
            <InfoRow
              label="Psychometrist"
              value={diagnosticCase.psychometrist?.user?.name}
            />
          </CardContent>
        </Card>
      </div>

      {/* Linked Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Linked Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {diagnosticCase.referral && (
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">
                  Referral: {diagnosticCase.referral.referralNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  {diagnosticCase.referral.childFirstName} {diagnosticCase.referral.childLastName}
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/referrals/${diagnosticCase.referral.id}`}>
                  View <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
          {diagnosticCase.client && (
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">
                  Client: {diagnosticCase.client.firstName} {diagnosticCase.client.lastName}
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/clients/${diagnosticCase.client.id}`}>
                  View <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
          {diagnosticCase.report && (
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Report</p>
                <StatusBadge status={diagnosticCase.report.status} type="report" />
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/reports/${diagnosticCase.report.id}`}>
                  View <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
          {diagnosticCase.billingRecords?.length > 0 &&
            diagnosticCase.billingRecords.map((record: any) => (
              <div key={record.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Billing</p>
                  <StatusBadge status={record.status} type="billing" />
                  <span className="text-sm text-muted-foreground">
                    ${record.billedAmount != null ? Number(record.billedAmount).toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Interviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Scheduled Interviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {diagnosticCase.interviews?.length > 0 ? (
            <div className="space-y-3">
              {diagnosticCase.interviews.map((interview: any) => (
                <div key={interview.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">
                      {INTERVIEW_TYPE_LABELS[interview.interviewType] ?? interview.interviewType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(interview.scheduledStart), "MMM d, yyyy h:mm a")} -{" "}
                      {format(new Date(interview.scheduledEnd), "h:mm a")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {interview.isCompleted && (
                      <Badge variant="outline" className="border-0 bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    )}
                    {interview.isCancelled && (
                      <Badge variant="outline" className="border-0 bg-red-100 text-red-800">
                        Cancelled
                      </Badge>
                    )}
                    {!interview.isCompleted && !interview.isCancelled && (
                      <Badge variant="outline" className="border-0 bg-blue-100 text-blue-800">
                        Scheduled
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/scheduling/${interview.id}`}>
                        View <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No interviews scheduled yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children || <span className="text-sm font-medium">{value ?? "\u2014"}</span>}
    </div>
  );
}
