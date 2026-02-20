"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Textarea } from "@clearpath/ui/components/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { FormField } from "@/components/form-field";
import { updateBillingSchema, type UpdateBillingInput } from "@/lib/validations/billing";

export function BillingEditForm({ record }: { record: any }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UpdateBillingInput>({
    resolver: zodResolver(updateBillingSchema),
    defaultValues: {
      cptCode: record.cptCode ?? "",
      billedAmount: record.billedAmount ? Number(record.billedAmount) : undefined,
      allowedAmount: record.allowedAmount ? Number(record.allowedAmount) : undefined,
      paidAmount: record.paidAmount ? Number(record.paidAmount) : undefined,
      adjustmentAmount: record.adjustmentAmount ? Number(record.adjustmentAmount) : undefined,
      payerName: record.payerName ?? "",
      claimNumber: record.claimNumber ?? "",
      notes: record.notes ?? "",
    },
  });

  async function onSubmit(data: UpdateBillingInput) {
    try {
      const res = await fetch(`/api/billing/${record.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (json.success) { toast.success("Record updated"); router.push(`/billing/${record.id}`); }
      else toast.error(json.error);
    } catch { toast.error("Failed to update"); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Billing Information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField label="CPT Code" htmlFor="cptCode"><Input id="cptCode" {...register("cptCode")} /></FormField>
          <FormField label="Billed Amount" htmlFor="billedAmount"><Input id="billedAmount" type="number" step="0.01" {...register("billedAmount")} /></FormField>
          <FormField label="Allowed Amount" htmlFor="allowedAmount"><Input id="allowedAmount" type="number" step="0.01" {...register("allowedAmount")} /></FormField>
          <FormField label="Paid Amount" htmlFor="paidAmount"><Input id="paidAmount" type="number" step="0.01" {...register("paidAmount")} /></FormField>
          <FormField label="Adjustment" htmlFor="adjustmentAmount"><Input id="adjustmentAmount" type="number" step="0.01" {...register("adjustmentAmount")} /></FormField>
          <FormField label="Payer" htmlFor="payerName"><Input id="payerName" {...register("payerName")} /></FormField>
          <FormField label="Claim Number" htmlFor="claimNumber"><Input id="claimNumber" {...register("claimNumber")} /></FormField>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6"><FormField label="Notes" htmlFor="notes"><Textarea id="notes" rows={3} {...register("notes")} /></FormField></CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
      </div>
    </form>
  );
}
