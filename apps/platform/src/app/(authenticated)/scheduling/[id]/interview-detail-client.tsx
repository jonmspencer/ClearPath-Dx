"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { Pencil, ArrowRight, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Badge } from "@clearpath/ui/components/badge";
import { Separator } from "@clearpath/ui/components/separator";
import { ConfirmDialog } from "@/components/confirm-dialog";

const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  PARENT_INTERVIEW: "Parent Interview",
  CHILD_OBSERVATION: "Child Observation",
  SCHOOL_OBSERVATION: "School Observation",
  TESTING_SESSION: "Testing Session",
  FEEDBACK_SESSION: "Feedback Session",
};

interface InterviewDetailProps {
  interview: any;
}

export function InterviewDetailClient({ interview }: InterviewDetailProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  async function markCompleted() {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/scheduling/interviews/${interview.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: true, actualEnd: new Date() }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Interview marked as completed");
        router.refresh();
      } else {
        toast.error(json.error || "Failed to update");
      }
    } catch {
      toast.error("Failed to update");
    }
    setIsUpdating(false);
  }

  async function cancelInterview() {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/scheduling/interviews/${interview.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCancelled: true, cancelledReason: "Cancelled by user" }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Interview cancelled");
        router.refresh();
      } else {
        toast.error(json.error || "Failed to cancel");
      }
    } catch {
      toast.error("Failed to cancel");
    }
    setIsUpdating(false);
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/scheduling/interviews/${interview.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Interview deleted");
        router.push("/scheduling");
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
          <Link href={`/scheduling/${interview.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Link>
        </Button>
        {!interview.isCompleted && !interview.isCancelled && (
          <>
            <Button
              variant="outline"
              onClick={markCompleted}
              disabled={isUpdating}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
            </Button>
            <ConfirmDialog
              title="Cancel Interview"
              description="Are you sure you want to cancel this interview?"
              confirmLabel="Cancel Interview"
              variant="destructive"
              onConfirm={cancelInterview}
            >
              <Button variant="outline" size="sm" disabled={isUpdating}>
                <XCircle className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </ConfirmDialog>
          </>
        )}
        <div className="flex-1" />
        <ConfirmDialog
          title="Delete Interview"
          description="Are you sure you want to delete this interview? This action cannot be undone."
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
        {/* Interview Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Interview Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              label="Type"
              value={INTERVIEW_TYPE_LABELS[interview.interviewType] ?? interview.interviewType}
            />
            <InfoRow label="Status">
              {interview.isCancelled ? (
                <Badge variant="outline" className="border-0 bg-red-100 text-red-800">
                  Cancelled
                </Badge>
              ) : interview.isCompleted ? (
                <Badge variant="outline" className="border-0 bg-green-100 text-green-800">
                  Completed
                </Badge>
              ) : (
                <Badge variant="outline" className="border-0 bg-blue-100 text-blue-800">
                  Scheduled
                </Badge>
              )}
            </InfoRow>
            <InfoRow
              label="Scheduled Start"
              value={format(new Date(interview.scheduledStart), "MMM d, yyyy h:mm a")}
            />
            <InfoRow
              label="Scheduled End"
              value={format(new Date(interview.scheduledEnd), "MMM d, yyyy h:mm a")}
            />
            {interview.actualStart && (
              <InfoRow
                label="Actual Start"
                value={format(new Date(interview.actualStart), "MMM d, yyyy h:mm a")}
              />
            )}
            {interview.actualEnd && (
              <InfoRow
                label="Actual End"
                value={format(new Date(interview.actualEnd), "MMM d, yyyy h:mm a")}
              />
            )}
            <InfoRow label="Location" value={interview.location} />
            {interview.meetingLink && (
              <InfoRow label="Meeting Link">
                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Join Meeting
                </a>
              </InfoRow>
            )}
            {interview.cancelledReason && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cancellation Reason</p>
                  <p className="mt-1 text-sm">{interview.cancelledReason}</p>
                </div>
              </>
            )}
            {interview.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm">{interview.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Provider & Linked Records */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Provider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Name" value={interview.provider?.user?.name} />
              <InfoRow label="Email" value={interview.provider?.user?.email} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Linked Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {interview.case && (
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">Case: {interview.case.caseNumber}</p>
                    {interview.case.client && (
                      <p className="text-xs text-muted-foreground">
                        {interview.case.client.firstName} {interview.case.client.lastName}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/cases/${interview.case.id}`}>
                      View <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
              {interview.case?.referral && (
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">
                      Referral: {interview.case.referral.referralNumber}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/referrals/${interview.case.referral.id}`}>
                      View <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
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
