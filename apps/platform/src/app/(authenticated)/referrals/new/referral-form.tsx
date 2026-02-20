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
import { createReferralSchema, type CreateReferralInput } from "@/lib/validations/referral";

interface ReferralFormProps {
  organizations: { id: string; name: string; type: string }[];
}

export function ReferralForm({ organizations }: ReferralFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateReferralInput>({
    resolver: zodResolver(createReferralSchema),
    defaultValues: {
      priority: "STANDARD",
      channel: "PORTAL",
    },
  });

  async function onSubmit(data: CreateReferralInput) {
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Referral created successfully");
        router.push(`/referrals/${json.data.id}`);
      } else {
        toast.error(json.error || "Failed to create referral");
      }
    } catch {
      toast.error("Failed to create referral");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Referral Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Referral Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Referring Organization" htmlFor="referringOrgId" error={errors.referringOrgId} required>
              <Select onValueChange={(v) => setValue("referringOrgId", v)} defaultValue={watch("referringOrgId")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization..." />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Channel" htmlFor="channel" error={errors.channel} required>
              <Select onValueChange={(v) => setValue("channel", v as any)} defaultValue="PORTAL">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FAX">Fax</SelectItem>
                  <SelectItem value="PHONE">Phone</SelectItem>
                  <SelectItem value="PORTAL">Portal</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="WALK_IN">Walk-in</SelectItem>
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
          </CardContent>
        </Card>

        {/* Child Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Child Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="First Name" htmlFor="childFirstName" error={errors.childFirstName} required>
              <Input id="childFirstName" {...register("childFirstName")} />
            </FormField>

            <FormField label="Last Name" htmlFor="childLastName" error={errors.childLastName} required>
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

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Reason for Referral" htmlFor="reasonForReferral" error={errors.reasonForReferral}>
            <Textarea id="reasonForReferral" rows={4} {...register("reasonForReferral")} placeholder="Describe the reason for this referral..." />
          </FormField>
          <FormField label="Notes" htmlFor="notes" error={errors.notes}>
            <Textarea id="notes" rows={3} {...register("notes")} placeholder="Additional notes..." />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Referral"}
        </Button>
      </div>
    </form>
  );
}
