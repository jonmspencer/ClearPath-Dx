"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@clearpath/ui/components/button";
import { Textarea } from "@clearpath/ui/components/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { FormField } from "@/components/form-field";
import { updateReportSchema, type UpdateReportInput } from "@/lib/validations/report";

export function ReportEditForm({ report }: { report: any }) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver: any = zodResolver(updateReportSchema);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UpdateReportInput>({
    resolver,
    defaultValues: {
      reportContent: report.reportContent ?? "",
      summary: report.summary ?? "",
      recommendations: report.recommendations ?? "",
    },
  });

  async function onSubmit(data: UpdateReportInput) {
    try {
      const res = await fetch(`/api/reports/${report.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (json.success) { toast.success("Report updated"); router.push(`/reports/${report.id}`); }
      else toast.error(json.error);
    } catch { toast.error("Failed to update report"); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Report Content</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Summary" htmlFor="summary" error={errors.summary}>
            <Textarea id="summary" rows={3} {...register("summary")} />
          </FormField>
          <FormField label="Report Content" htmlFor="reportContent" error={errors.reportContent}>
            <Textarea id="reportContent" rows={12} {...register("reportContent")} />
          </FormField>
          <FormField label="Recommendations" htmlFor="recommendations" error={errors.recommendations}>
            <Textarea id="recommendations" rows={4} {...register("recommendations")} />
          </FormField>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
      </div>
    </form>
  );
}
