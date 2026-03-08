"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { Pencil, Send, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Separator } from "@clearpath/ui/components/separator";
import { Badge } from "@clearpath/ui/components/badge";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function ReportDetailClient({
  report,
  isAuthor,
  canEdit,
  canApprove,
  canDelete,
}: {
  report: any;
  isAuthor: boolean;
  canEdit: boolean;
  canApprove: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitForReview() {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/reports/${report.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewerId: report.author.id }),
      });
      const json = await res.json();
      if (json.success) { toast.success("Report submitted for review"); router.refresh(); }
      else toast.error(json.error);
    } catch { toast.error("Failed to submit"); }
    setIsSubmitting(false);
  }

  async function handleApprove(isApproved: boolean) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/reports/${report.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
      });
      const json = await res.json();
      if (json.success) { toast.success(isApproved ? "Report approved" : "Revision requested"); router.refresh(); }
      else toast.error(json.error);
    } catch { toast.error("Failed"); }
    setIsSubmitting(false);
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/reports/${report.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { toast.success("Report deleted"); router.push("/reports"); }
      else toast.error(json.error);
    } catch { toast.error("Failed to delete"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        {canEdit && (
          <Button variant="outline" asChild>
            <Link href={`/reports/${report.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> Edit</Link>
          </Button>
        )}
        {isAuthor && report.status === "DRAFT" && (
          <Button onClick={submitForReview} disabled={isSubmitting}><Send className="mr-2 h-4 w-4" /> Submit for Review</Button>
        )}
        {canApprove && report.status === "IN_REVIEW" && (
          <>
            <Button onClick={() => handleApprove(true)} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="mr-2 h-4 w-4" /> Approve
            </Button>
            <Button variant="outline" onClick={() => handleApprove(false)} disabled={isSubmitting} className="text-amber-600">
              <XCircle className="mr-2 h-4 w-4" /> Request Revision
            </Button>
          </>
        )}
        <div className="flex-1" />
        {canDelete && (
          <ConfirmDialog title="Delete Report" description="This will permanently delete the report." confirmLabel="Delete" variant="destructive" onConfirm={handleDelete}>
            <Button variant="outline" size="sm" className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
          </ConfirmDialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Report Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Status"><StatusBadge status={report.status} type="report" /></InfoRow>
            <InfoRow label="Case" value={report.diagnosticCase.caseNumber} />
            <InfoRow label="Client" value={`${report.diagnosticCase.client.firstName} ${report.diagnosticCase.client.lastName}`} />
            <InfoRow label="Author" value={report.author.user.name} />
            <InfoRow label="Created" value={format(new Date(report.createdAt), "MMM d, yyyy")} />
            {report.submittedAt && <InfoRow label="Submitted" value={format(new Date(report.submittedAt), "MMM d, yyyy")} />}
            {report.approvedAt && <InfoRow label="Approved" value={format(new Date(report.approvedAt), "MMM d, yyyy")} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Diagnoses & Recommendations</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Diagnoses</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {report.diagnoses?.length > 0 ? report.diagnoses.map((d: string, i: number) => <Badge key={i} variant="outline">{d}</Badge>) : <span className="text-sm text-muted-foreground">None yet</span>}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Summary</p>
              <p className="mt-1 text-sm">{report.summary || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recommendations</p>
              <p className="mt-1 text-sm whitespace-pre-wrap">{report.recommendations || "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {report.reportContent && (
        <Card>
          <CardHeader><CardTitle className="text-base">Report Content</CardTitle></CardHeader>
          <CardContent><div className="prose max-w-none text-sm whitespace-pre-wrap">{report.reportContent}</div></CardContent>
        </Card>
      )}

      {report.reviewQueue?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Review History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.reviewQueue.map((item: any) => (
                <div key={item.id} className="flex items-start gap-3 rounded-md border p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.reviewer.user.name}</p>
                    <p className="text-xs text-muted-foreground">Assigned {format(new Date(item.assignedAt), "MMM d, yyyy")}</p>
                    {item.completedAt && <p className="text-xs text-muted-foreground">Completed {format(new Date(item.completedAt), "MMM d, yyyy")}</p>}
                    {item.reviewNotes && <p className="mt-1 text-sm">{item.reviewNotes}</p>}
                  </div>
                  {item.isApproved !== null && (
                    <Badge variant={item.isApproved ? "default" : "outline"}>
                      {item.isApproved ? "Approved" : "Revision Needed"}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
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
