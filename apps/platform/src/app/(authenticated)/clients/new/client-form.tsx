"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
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
import { Separator } from "@clearpath/ui/components/separator";
import { FormField } from "@/components/form-field";
import { createClientSchema, type CreateClientInput } from "@/lib/validations/client";

interface ClientFormProps {
  organizations: { id: string; name: string; type: string }[];
  referrals: {
    id: string;
    referralNumber: string;
    childFirstName: string;
    childLastName: string;
    referringOrgId: string;
  }[];
}

export function ClientForm({ organizations, referrals }: ClientFormProps) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver: any = zodResolver(createClientSchema);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateClientInput>({
    resolver,
    defaultValues: {
      guardians: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "guardians",
  });

  const selectedReferralId = watch("referralId");

  function handleReferralChange(referralId: string) {
    setValue("referralId", referralId);
    const referral = referrals.find((r) => r.id === referralId);
    if (referral) {
      setValue("firstName", referral.childFirstName);
      setValue("lastName", referral.childLastName);
      setValue("referringOrgId", referral.referringOrgId);
    }
  }

  async function onSubmit(data: CreateClientInput) {
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Client created successfully");
        router.push(`/clients/${json.data.id}`);
      } else {
        toast.error(json.error || "Failed to create client");
      }
    } catch {
      toast.error("Failed to create client");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Referral & Org */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Referral Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Referral" htmlFor="referralId" error={errors.referralId} required>
              <Select onValueChange={handleReferralChange} defaultValue={selectedReferralId}>
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

            <FormField label="Referring Organization" htmlFor="referringOrgId" error={errors.referringOrgId} required>
              <Select
                onValueChange={(v) => setValue("referringOrgId", v)}
                value={watch("referringOrgId") ?? ""}
              >
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
          </CardContent>
        </Card>

        {/* Client Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="First Name" htmlFor="firstName" error={errors.firstName} required>
              <Input id="firstName" {...register("firstName")} />
            </FormField>

            <FormField label="Last Name" htmlFor="lastName" error={errors.lastName} required>
              <Input id="lastName" {...register("lastName")} />
            </FormField>

            <FormField label="Date of Birth" htmlFor="dateOfBirth" error={errors.dateOfBirth} required>
              <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
            </FormField>

            <FormField label="Gender" htmlFor="gender" error={errors.gender}>
              <Select onValueChange={(v) => setValue("gender", v)}>
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
              <Input id="primaryLanguage" {...register("primaryLanguage")} placeholder="English" />
            </FormField>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* School */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">School Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="School Name" htmlFor="schoolName" error={errors.schoolName}>
              <Input id="schoolName" {...register("schoolName")} />
            </FormField>
            <FormField label="Grade" htmlFor="grade" error={errors.grade}>
              <Input id="grade" {...register("grade")} />
            </FormField>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Street Address" htmlFor="address" error={errors.address}>
              <Input id="address" {...register("address")} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="City" htmlFor="city" error={errors.city}>
                <Input id="city" {...register("city")} />
              </FormField>
              <FormField label="State" htmlFor="state" error={errors.state}>
                <Input id="state" {...register("state")} />
              </FormField>
              <FormField label="Zip Code" htmlFor="zipCode" error={errors.zipCode}>
                <Input id="zipCode" {...register("zipCode")} />
              </FormField>
            </div>
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

      {/* Guardians */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Guardians</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                firstName: "",
                lastName: "",
                relationship: "",
                email: "",
                phone: "",
                isPrimary: fields.length === 0,
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add Guardian
          </Button>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No guardians added yet. Click &quot;Add Guardian&quot; to add one.
            </p>
          ) : (
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id}>
                  {index > 0 && <Separator className="mb-6" />}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Guardian {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" /> Remove
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        label="First Name"
                        htmlFor={`guardians.${index}.firstName`}
                        error={errors.guardians?.[index]?.firstName}
                        required
                      >
                        <Input
                          id={`guardians.${index}.firstName`}
                          {...register(`guardians.${index}.firstName`)}
                        />
                      </FormField>
                      <FormField
                        label="Last Name"
                        htmlFor={`guardians.${index}.lastName`}
                        error={errors.guardians?.[index]?.lastName}
                        required
                      >
                        <Input
                          id={`guardians.${index}.lastName`}
                          {...register(`guardians.${index}.lastName`)}
                        />
                      </FormField>
                    </div>
                    <FormField
                      label="Relationship"
                      htmlFor={`guardians.${index}.relationship`}
                      error={errors.guardians?.[index]?.relationship}
                      required
                    >
                      <Select
                        onValueChange={(v) => setValue(`guardians.${index}.relationship`, v)}
                        defaultValue={watch(`guardians.${index}.relationship`)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MOTHER">Mother</SelectItem>
                          <SelectItem value="FATHER">Father</SelectItem>
                          <SelectItem value="STEPMOTHER">Stepmother</SelectItem>
                          <SelectItem value="STEPFATHER">Stepfather</SelectItem>
                          <SelectItem value="GRANDMOTHER">Grandmother</SelectItem>
                          <SelectItem value="GRANDFATHER">Grandfather</SelectItem>
                          <SelectItem value="LEGAL_GUARDIAN">Legal Guardian</SelectItem>
                          <SelectItem value="FOSTER_PARENT">Foster Parent</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        label="Email"
                        htmlFor={`guardians.${index}.email`}
                        error={errors.guardians?.[index]?.email}
                      >
                        <Input
                          id={`guardians.${index}.email`}
                          type="email"
                          {...register(`guardians.${index}.email`)}
                        />
                      </FormField>
                      <FormField
                        label="Phone"
                        htmlFor={`guardians.${index}.phone`}
                        error={errors.guardians?.[index]?.phone}
                      >
                        <Input
                          id={`guardians.${index}.phone`}
                          type="tel"
                          {...register(`guardians.${index}.phone`)}
                        />
                      </FormField>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`guardians.${index}.isPrimary`}
                        {...register(`guardians.${index}.isPrimary`)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label htmlFor={`guardians.${index}.isPrimary`} className="text-sm">
                        Primary Guardian
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Client"}
        </Button>
      </div>
    </form>
  );
}
