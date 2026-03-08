"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@clearpath/ui/components/select";
import { FormField } from "@/components/form-field";
import { updateClientSchema, type UpdateClientInput } from "@/lib/validations/client";

interface Props {
  client: any;
}

export function ClientEditForm({ client }: Props) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver: any = zodResolver(updateClientSchema);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateClientInput>({
    resolver,
    defaultValues: {
      firstName: client.firstName,
      lastName: client.lastName,
      dateOfBirth: client.dateOfBirth ? new Date(client.dateOfBirth) : undefined,
      gender: client.gender ?? undefined,
      preferredName: client.preferredName ?? "",
      primaryLanguage: client.primaryLanguage ?? "",
      schoolName: client.schoolName ?? "",
      grade: client.grade ?? "",
      address: client.address ?? "",
      city: client.city ?? "",
      state: client.state ?? "",
      zipCode: client.zipCode ?? "",
      insuranceProvider: client.insuranceProvider ?? "",
      insurancePolicyId: client.insurancePolicyId ?? "",
      insuranceGroupId: client.insuranceGroupId ?? "",
    },
  });

  async function onSubmit(data: UpdateClientInput) {
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Client updated successfully");
        router.push(`/clients/${client.id}`);
      } else {
        toast.error(json.error || "Failed to update client");
      }
    } catch {
      toast.error("Failed to update client");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="First Name" htmlFor="firstName" error={errors.firstName}>
              <Input id="firstName" {...register("firstName")} />
            </FormField>
            <FormField label="Last Name" htmlFor="lastName" error={errors.lastName}>
              <Input id="lastName" {...register("lastName")} />
            </FormField>
            <FormField label="Date of Birth" htmlFor="dateOfBirth" error={errors.dateOfBirth}>
              <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
            </FormField>
            <FormField label="Gender" htmlFor="gender" error={errors.gender}>
              <Select
                onValueChange={(v) => setValue("gender", v)}
                defaultValue={client.gender ?? undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="NON_BINARY">Non-binary</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                  <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Preferred Name" htmlFor="preferredName" error={errors.preferredName}>
              <Input id="preferredName" {...register("preferredName")} />
            </FormField>
            <FormField label="Primary Language" htmlFor="primaryLanguage" error={errors.primaryLanguage}>
              <Input id="primaryLanguage" {...register("primaryLanguage")} />
            </FormField>
          </CardContent>
        </Card>

        {/* School & Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">School & Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="School Name" htmlFor="schoolName" error={errors.schoolName}>
              <Input id="schoolName" {...register("schoolName")} />
            </FormField>
            <FormField label="Grade" htmlFor="grade" error={errors.grade}>
              <Input id="grade" {...register("grade")} />
            </FormField>
            <FormField label="Street Address" htmlFor="address" error={errors.address}>
              <Input id="address" {...register("address")} />
            </FormField>
            <FormField label="City" htmlFor="city" error={errors.city}>
              <Input id="city" {...register("city")} />
            </FormField>
            <FormField label="State" htmlFor="state" error={errors.state}>
              <Input id="state" {...register("state")} />
            </FormField>
            <FormField label="Zip Code" htmlFor="zipCode" error={errors.zipCode}>
              <Input id="zipCode" {...register("zipCode")} />
            </FormField>
          </CardContent>
        </Card>
      </div>

      {/* Insurance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Insurance Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Insurance Provider" htmlFor="insuranceProvider" error={errors.insuranceProvider}>
              <Input id="insuranceProvider" {...register("insuranceProvider")} />
            </FormField>
            <FormField label="Policy ID" htmlFor="insurancePolicyId" error={errors.insurancePolicyId}>
              <Input id="insurancePolicyId" {...register("insurancePolicyId")} />
            </FormField>
            <FormField label="Group ID" htmlFor="insuranceGroupId" error={errors.insuranceGroupId}>
              <Input id="insuranceGroupId" {...register("insuranceGroupId")} />
            </FormField>
          </div>
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
