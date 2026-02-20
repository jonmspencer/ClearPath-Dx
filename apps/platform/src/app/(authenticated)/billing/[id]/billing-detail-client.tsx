"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@clearpath/ui/components/select";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function BillingDetailClient({ record }: { record: any }) {
  const router = useRouter();

  async function updateStatus(status: string) {
    try {
      const res = await fetch(`/api/billing/${record.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) { toast.success("Status updated"); router.refresh(); }
      else toast.error(json.error);
    } catch { toast.error("Failed to update"); }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/billing/${record.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { toast.success("Record deleted"); router.push("/billing"); }
      else toast.error(json.error);
    } catch { toast.error("Failed to delete"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild><Link href={`/billing/${record.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> Edit</Link></Button>
        <Select onValueChange={updateStatus}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Update status..." /></SelectTrigger>
          <SelectContent>
            {["PENDING", "SUBMITTED", "ACCEPTED", "REJECTED", "PAID", "WRITTEN_OFF"].map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <ConfirmDialog title="Delete Record" description="This will permanently delete this billing record." confirmLabel="Delete" variant="destructive" onConfirm={handleDelete}>
          <Button variant="outline" size="sm" className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
        </ConfirmDialog>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Billing Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Status"><StatusBadge status={record.status} type="billing" /></InfoRow>
            <InfoRow label="Case" value={record.diagnosticCase.caseNumber} />
            <InfoRow label="Client" value={`${record.diagnosticCase.client.firstName} ${record.diagnosticCase.client.lastName}`} />
            <InfoRow label="Organization" value={record.organization.name} />
            <InfoRow label="CPT Code" value={record.cptCode} />
            <InfoRow label="Claim #" value={record.claimNumber} />
            <InfoRow label="Payer" value={record.payerName} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Financial</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Billed" value={record.billedAmount != null ? `$${Number(record.billedAmount).toFixed(2)}` : null} />
            <InfoRow label="Allowed" value={record.allowedAmount != null ? `$${Number(record.allowedAmount).toFixed(2)}` : null} />
            <InfoRow label="Paid" value={record.paidAmount != null ? `$${Number(record.paidAmount).toFixed(2)}` : null} />
            <InfoRow label="Adjustment" value={record.adjustmentAmount != null ? `$${Number(record.adjustmentAmount).toFixed(2)}` : null} />
            {record.submittedAt && <InfoRow label="Submitted" value={format(new Date(record.submittedAt), "MMM d, yyyy")} />}
            {record.paidAt && <InfoRow label="Paid On" value={format(new Date(record.paidAt), "MMM d, yyyy")} />}
          </CardContent>
        </Card>
      </div>
      {record.notes && (
        <Card>
          <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{record.notes}</p></CardContent>
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
