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
import { createInterviewSchema, type CreateInterviewInput } from "@/lib/validations/scheduling";

const INTERVIEW_TYPES = [
  { value: "PARENT_INTERVIEW", label: "Parent Interview" },
  { value: "CHILD_OBSERVATION", label: "Child Observation" },
  { value: "SCHOOL_OBSERVATION", label: "School Observation" },
  { value: "TESTING_SESSION", label: "Testing Session" },
  { value: "FEEDBACK_SESSION", label: "Feedback Session" },
];

interface InterviewFormProps {
  cases: {
    id: string;
    caseNumber: string;
    client: { firstName: string; lastName: string } | null;
  }[];
  providers: { id: string; user: { name: string } }[];
  defaultCaseId?: string;
}

export function InterviewForm({ cases, providers, defaultCaseId }: InterviewFormProps) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver: any = zodResolver(createInterviewSchema);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateInterviewInput>({
    resolver,
    defaultValues: {
      caseId: defaultCaseId ?? "",
      interviewType: "PARENT_INTERVIEW",
    },
  });

  async function onSubmit(data: CreateInterviewInput) {
    try {
      const res = await fetch("/api/scheduling/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Interview scheduled successfully");
        router.push(`/scheduling/${json.data.id}`);
      } else {
        toast.error(json.error || "Failed to schedule interview");
      }
    } catch {
      toast.error("Failed to schedule interview");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Interview Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Interview Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Case" htmlFor="caseId" error={errors.caseId} required>
              <Select
                onValueChange={(v) => setValue("caseId", v)}
                defaultValue={defaultCaseId ?? watch("caseId")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case..." />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.caseNumber}
                      {c.client && ` - ${c.client.firstName} ${c.client.lastName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Provider" htmlFor="providerId" error={errors.providerId} required>
              <Select onValueChange={(v) => setValue("providerId", v)} defaultValue={watch("providerId")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider..." />
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

            <FormField label="Interview Type" htmlFor="interviewType" error={errors.interviewType} required>
              <Select
                onValueChange={(v) => setValue("interviewType", v as any)}
                defaultValue="PARENT_INTERVIEW"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Start Date & Time" htmlFor="scheduledStart" error={errors.scheduledStart} required>
              <Input
                id="scheduledStart"
                type="datetime-local"
                {...register("scheduledStart")}
              />
            </FormField>

            <FormField label="End Date & Time" htmlFor="scheduledEnd" error={errors.scheduledEnd} required>
              <Input
                id="scheduledEnd"
                type="datetime-local"
                {...register("scheduledEnd")}
              />
            </FormField>

            <FormField label="Location" htmlFor="location" error={errors.location}>
              <Input
                id="location"
                {...register("location")}
                placeholder="Office, school, home, etc."
              />
            </FormField>

            <FormField label="Meeting Link" htmlFor="meetingLink" error={errors.meetingLink}>
              <Input
                id="meetingLink"
                {...register("meetingLink")}
                placeholder="https://..."
              />
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
            <Textarea id="notes" rows={4} {...register("notes")} placeholder="Interview notes..." />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Scheduling..." : "Schedule Interview"}
        </Button>
      </div>
    </form>
  );
}
