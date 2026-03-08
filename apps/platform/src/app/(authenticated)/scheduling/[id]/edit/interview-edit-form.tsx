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
import { updateInterviewSchema, type UpdateInterviewInput } from "@/lib/validations/scheduling";

const INTERVIEW_TYPES = [
  { value: "PARENT_INTERVIEW", label: "Parent Interview" },
  { value: "CHILD_OBSERVATION", label: "Child Observation" },
  { value: "SCHOOL_OBSERVATION", label: "School Observation" },
  { value: "TESTING_SESSION", label: "Testing Session" },
  { value: "FEEDBACK_SESSION", label: "Feedback Session" },
];

function toLocalDatetime(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

interface Props {
  interview: any;
  providers: { id: string; user: { name: string } }[];
}

export function InterviewEditForm({ interview, providers }: Props) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver: any = zodResolver(updateInterviewSchema);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateInterviewInput>({
    resolver,
    defaultValues: {
      providerId: interview.providerId,
      interviewType: interview.interviewType,
      scheduledStart: interview.scheduledStart ? new Date(interview.scheduledStart) : undefined,
      scheduledEnd: interview.scheduledEnd ? new Date(interview.scheduledEnd) : undefined,
      location: interview.location ?? "",
      meetingLink: interview.meetingLink ?? "",
      notes: interview.notes ?? "",
    },
  });

  async function onSubmit(data: UpdateInterviewInput) {
    try {
      const res = await fetch(`/api/scheduling/interviews/${interview.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Interview updated successfully");
        router.push(`/scheduling/${interview.id}`);
      } else {
        toast.error(json.error || "Failed to update interview");
      }
    } catch {
      toast.error("Failed to update interview");
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
            <FormField label="Provider" htmlFor="providerId" error={errors.providerId}>
              <Select
                onValueChange={(v) => setValue("providerId", v)}
                defaultValue={interview.providerId}
              >
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

            <FormField label="Interview Type" htmlFor="interviewType" error={errors.interviewType}>
              <Select
                onValueChange={(v) => setValue("interviewType", v as any)}
                defaultValue={interview.interviewType}
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

            <FormField label="Location" htmlFor="location" error={errors.location}>
              <Input id="location" {...register("location")} />
            </FormField>

            <FormField label="Meeting Link" htmlFor="meetingLink" error={errors.meetingLink}>
              <Input id="meetingLink" {...register("meetingLink")} />
            </FormField>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Start Date & Time" htmlFor="scheduledStart" error={errors.scheduledStart}>
              <Input
                id="scheduledStart"
                type="datetime-local"
                defaultValue={toLocalDatetime(interview.scheduledStart)}
                {...register("scheduledStart")}
              />
            </FormField>

            <FormField label="End Date & Time" htmlFor="scheduledEnd" error={errors.scheduledEnd}>
              <Input
                id="scheduledEnd"
                type="datetime-local"
                defaultValue={toLocalDatetime(interview.scheduledEnd)}
                {...register("scheduledEnd")}
              />
            </FormField>

            <FormField label="Actual Start" htmlFor="actualStart" error={errors.actualStart}>
              <Input
                id="actualStart"
                type="datetime-local"
                defaultValue={toLocalDatetime(interview.actualStart)}
                {...register("actualStart")}
              />
            </FormField>

            <FormField label="Actual End" htmlFor="actualEnd" error={errors.actualEnd}>
              <Input
                id="actualEnd"
                type="datetime-local"
                defaultValue={toLocalDatetime(interview.actualEnd)}
                {...register("actualEnd")}
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
