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
import { createCaseSchema, type CreateCaseInput } from "@/lib/validations/case";

interface CaseFormProps {
  referrals: { id: string; referralNumber: string; childFirstName: string; childLastName: string }[];
  clients: { id: string; firstName: string; lastName: string }[];
  users: { id: string; name: string; email: string }[];
  providers: { id: string; user: { name: string }; specialties: string[] }[];
}

export function CaseForm({ referrals, clients, users, providers }: CaseFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateCaseInput>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: {
      priority: "STANDARD",
    },
  });

  async function onSubmit(data: CreateCaseInput) {
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Diagnostic case created successfully");
        router.push(`/cases/${json.data.id}`);
      } else {
        toast.error(json.error || "Failed to create case");
      }
    } catch {
      toast.error("Failed to create case");
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
            <FormField label="Referral" htmlFor="referralId" error={errors.referralId} required>
              <Select onValueChange={(v) => setValue("referralId", v)} defaultValue={watch("referralId")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select referral..." />
                </SelectTrigger>
                <SelectContent>
                  {referrals.map((ref) => (
                    <SelectItem key={ref.id} value={ref.id}>
                      {ref.referralNumber} - {ref.childFirstName} {ref.childLastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Client" htmlFor="clientId" error={errors.clientId} required>
              <Select onValueChange={(v) => setValue("clientId", v)} defaultValue={watch("clientId")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Priority" htmlFor="priority" error={errors.priority}>
              <Select onValueChange={(v) => setValue("priority", v as any)} defaultValue="STANDARD">
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

            <FormField label="Target Completion Date" htmlFor="targetCompletionDate" error={errors.targetCompletionDate}>
              <Input id="targetCompletionDate" type="date" {...register("targetCompletionDate")} />
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
              <Select onValueChange={(v) => setValue("coordinatorId", v)} defaultValue={watch("coordinatorId")}>
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
              <Select onValueChange={(v) => setValue("schedulerId", v)} defaultValue={watch("schedulerId")}>
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
              <Select onValueChange={(v) => setValue("psychologistId", v)} defaultValue={watch("psychologistId")}>
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
              <Select onValueChange={(v) => setValue("psychometristId", v)} defaultValue={watch("psychometristId")}>
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
            <Textarea id="notes" rows={4} {...register("notes")} placeholder="Case notes..." />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Case"}
        </Button>
      </div>
    </form>
  );
}
