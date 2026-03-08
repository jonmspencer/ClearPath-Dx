"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Textarea } from "@clearpath/ui/components/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@clearpath/ui/components/select";
import { FormField } from "@/components/form-field";
import { updateCaseSchema, type UpdateCaseInput } from "@/lib/validations/case";

interface Props {
  diagnosticCase: any;
  users: { id: string; name: string; email: string }[];
  providers: { id: string; user: { name: string }; specialties: string[] }[];
}

export function CaseEditForm({ diagnosticCase, users, providers }: Props) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver: any = zodResolver(updateCaseSchema);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCaseInput>({
    resolver,
    defaultValues: {
      priority: diagnosticCase.priority,
      coordinatorId: diagnosticCase.coordinatorId ?? undefined,
      schedulerId: diagnosticCase.schedulerId ?? undefined,
      psychologistId: diagnosticCase.psychologistId ?? undefined,
      psychometristId: diagnosticCase.psychometristId ?? undefined,
      targetCompletionDate: diagnosticCase.targetCompletionDate
        ? new Date(diagnosticCase.targetCompletionDate)
        : undefined,
      actualCompletionDate: diagnosticCase.actualCompletionDate
        ? new Date(diagnosticCase.actualCompletionDate)
        : undefined,
      notes: diagnosticCase.notes ?? "",
    },
  });

  async function onSubmit(data: UpdateCaseInput) {
    try {
      const res = await fetch(`/api/cases/${diagnosticCase.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Case updated successfully");
        router.push(`/cases/${diagnosticCase.id}`);
      } else {
        toast.error(json.error || "Failed to update case");
      }
    } catch {
      toast.error("Failed to update case");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Case Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Case Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Priority" htmlFor="priority" error={errors.priority}>
              <Select
                onValueChange={(v) => setValue("priority", v as any)}
                defaultValue={diagnosticCase.priority}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="EXPEDITED">Expedited</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Target Completion Date"
              htmlFor="targetCompletionDate"
              error={errors.targetCompletionDate}
            >
              <Input
                id="targetCompletionDate"
                type="date"
                {...register("targetCompletionDate")}
              />
            </FormField>

            <FormField
              label="Actual Completion Date"
              htmlFor="actualCompletionDate"
              error={errors.actualCompletionDate}
            >
              <Input
                id="actualCompletionDate"
                type="date"
                {...register("actualCompletionDate")}
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Team Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Coordinator" htmlFor="coordinatorId" error={errors.coordinatorId}>
              <Select
                onValueChange={(v) => setValue("coordinatorId", v)}
                defaultValue={diagnosticCase.coordinatorId ?? undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select coordinator..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Scheduler" htmlFor="schedulerId" error={errors.schedulerId}>
              <Select
                onValueChange={(v) => setValue("schedulerId", v)}
                defaultValue={diagnosticCase.schedulerId ?? undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scheduler..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Psychologist" htmlFor="psychologistId" error={errors.psychologistId}>
              <Select
                onValueChange={(v) => setValue("psychologistId", v)}
                defaultValue={diagnosticCase.psychologistId ?? undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select psychologist..." />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Psychometrist" htmlFor="psychometristId" error={errors.psychometristId}>
              <Select
                onValueChange={(v) => setValue("psychometristId", v)}
                defaultValue={diagnosticCase.psychometristId ?? undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select psychometrist..." />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Notes" htmlFor="notes" error={errors.notes}>
            <Textarea id="notes" rows={4} {...register("notes")} />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
