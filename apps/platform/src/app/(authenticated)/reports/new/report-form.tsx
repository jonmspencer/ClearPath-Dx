"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@clearpath/ui/components/button";
import { Textarea } from "@clearpath/ui/components/textarea";
import { Input } from "@clearpath/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@clearpath/ui/components/select";
import { FormField } from "@/components/form-field";
import { createReportSchema, type CreateReportInput } from "@/lib/validations/report";

interface Props {
  cases: { id: string; caseNumber: string; client: { firstName: string; lastName: string } }[];
}

export function ReportForm({ cases }: Props) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver: any = zodResolver(createReportSchema);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<CreateReportInput>({
    resolver,
    defaultValues: { diagnoses: [] },
  });

  async function onSubmit(data: CreateReportInput) {
    try {
      const res = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (json.success) { toast.success("Report created"); router.push(`/reports/${json.data.id}`); }
      else toast.error(json.error || "Failed to create report");
    } catch { toast.error("Failed to create report"); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Report Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Case" htmlFor="caseId" error={errors.caseId} required>
            <Select onValueChange={(v) => setValue("caseId", v)}>
              <SelectTrigger><SelectValue placeholder="Select case..." /></SelectTrigger>
              <SelectContent>
                {cases.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.caseNumber} — {c.client.firstName} {c.client.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Summary" htmlFor="summary" error={errors.summary}>
            <Textarea id="summary" rows={3} {...register("summary")} placeholder="Brief summary of findings..." />
          </FormField>
          <FormField label="Report Content" htmlFor="reportContent" error={errors.reportContent}>
            <Textarea id="reportContent" rows={10} {...register("reportContent")} placeholder="Full report content..." />
          </FormField>
          <FormField label="Recommendations" htmlFor="recommendations" error={errors.recommendations}>
            <Textarea id="recommendations" rows={4} {...register("recommendations")} placeholder="Treatment recommendations..." />
          </FormField>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Report"}</Button>
      </div>
    </form>
  );
}
