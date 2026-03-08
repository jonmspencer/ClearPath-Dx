"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Textarea } from "@clearpath/ui/components/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@clearpath/ui/components/select";
import { FormField } from "@/components/form-field";
import { createBillingSchema, type CreateBillingInput } from "@/lib/validations/billing";

interface Props {
  cases: { id: string; caseNumber: string; client: { firstName: string; lastName: string } }[];
  organizations: { id: string; name: string }[];
}

export function BillingForm({ cases, organizations }: Props) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver = zodResolver(createBillingSchema) as any;
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<CreateBillingInput>({
    resolver,
  });

  async function onSubmit(data: CreateBillingInput) {
    try {
      const res = await fetch("/api/billing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (json.success) { toast.success("Billing record created"); router.push(`/billing/${json.data.id}`); }
      else toast.error(json.error);
    } catch { toast.error("Failed to create billing record"); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Case & Organization</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Case" error={errors.caseId} required>
              <Select onValueChange={(v) => setValue("caseId", v)}>
                <SelectTrigger><SelectValue placeholder="Select case..." /></SelectTrigger>
                <SelectContent>{cases.map((c) => <SelectItem key={c.id} value={c.id}>{c.caseNumber} — {c.client.firstName} {c.client.lastName}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Organization" error={errors.organizationId} required>
              <Select onValueChange={(v) => setValue("organizationId", v)}>
                <SelectTrigger><SelectValue placeholder="Select org..." /></SelectTrigger>
                <SelectContent>{organizations.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Billing Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="CPT Code" htmlFor="cptCode" error={errors.cptCode}><Input id="cptCode" {...register("cptCode")} placeholder="e.g. 96130" /></FormField>
            <FormField label="Billed Amount" htmlFor="billedAmount" error={errors.billedAmount}><Input id="billedAmount" type="number" step="0.01" {...register("billedAmount")} /></FormField>
            <FormField label="Allowed Amount" htmlFor="allowedAmount" error={errors.allowedAmount}><Input id="allowedAmount" type="number" step="0.01" {...register("allowedAmount")} /></FormField>
            <FormField label="Payer" htmlFor="payerName" error={errors.payerName}><Input id="payerName" {...register("payerName")} /></FormField>
            <FormField label="Claim Number" htmlFor="claimNumber" error={errors.claimNumber}><Input id="claimNumber" {...register("claimNumber")} /></FormField>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="pt-6">
          <FormField label="Notes" htmlFor="notes" error={errors.notes}><Textarea id="notes" rows={3} {...register("notes")} /></FormField>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Record"}</Button>
      </div>
    </form>
  );
}
