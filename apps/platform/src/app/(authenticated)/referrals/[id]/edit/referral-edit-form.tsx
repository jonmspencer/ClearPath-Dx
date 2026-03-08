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
import { updateReferralSchema, type UpdateReferralInput } from "@/lib/validations/referral";

interface Props {
  referral: any;
  organizations: { id: string; name: string; type: string }[];
}

export function ReferralEditForm({ referral, organizations }: Props) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver = zodResolver(updateReferralSchema) as any;
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateReferralInput>({
    resolver,
    defaultValues: {
      priority: referral.priority,
      childFirstName: referral.childFirstName,
      childLastName: referral.childLastName,
      childDateOfBirth: referral.childDateOfBirth ? new Date(referral.childDateOfBirth) : undefined,
      childAge: referral.childAge ?? undefined,
      reasonForReferral: referral.reasonForReferral ?? "",
      insuranceInfo: referral.insuranceInfo ?? "",
      notes: referral.notes ?? "",
    },
  });

  async function onSubmit(data: UpdateReferralInput) {
    try {
      const res = await fetch(`/api/referrals/${referral.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Referral updated successfully");
        router.push(`/referrals/${referral.id}`);
      } else {
        toast.error(json.error || "Failed to update referral");
      }
    } catch {
      toast.error("Failed to update referral");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Referral Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Priority" htmlFor="priority" error={errors.priority}>
              <Select onValueChange={(v) => setValue("priority", v as any)} defaultValue={referral.priority}>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Child Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="First Name" htmlFor="childFirstName" error={errors.childFirstName}>
              <Input id="childFirstName" {...register("childFirstName")} />
            </FormField>
            <FormField label="Last Name" htmlFor="childLastName" error={errors.childLastName}>
              <Input id="childLastName" {...register("childLastName")} />
            </FormField>
            <FormField label="Date of Birth" htmlFor="childDateOfBirth" error={errors.childDateOfBirth}>
              <Input id="childDateOfBirth" type="date" {...register("childDateOfBirth")} />
            </FormField>
            <FormField label="Age" htmlFor="childAge" error={errors.childAge}>
              <Input id="childAge" type="number" min="0" max="25" {...register("childAge")} />
            </FormField>
            <FormField label="Insurance Info" htmlFor="insuranceInfo" error={errors.insuranceInfo}>
              <Input id="insuranceInfo" {...register("insuranceInfo")} />
            </FormField>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Reason for Referral" htmlFor="reasonForReferral" error={errors.reasonForReferral}>
            <Textarea id="reasonForReferral" rows={4} {...register("reasonForReferral")} />
          </FormField>
          <FormField label="Notes" htmlFor="notes" error={errors.notes}>
            <Textarea id="notes" rows={3} {...register("notes")} />
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
