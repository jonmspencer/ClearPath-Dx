"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@clearpath/ui/components/select";
import { FormField } from "@/components/form-field";
import { createOrganizationSchema, type CreateOrganizationInput } from "@/lib/validations/organization";

const ORG_TYPES = [
  { value: "DIAGNOSTICS_OPERATOR", label: "Diagnostics Operator" },
  { value: "ABA_PROVIDER", label: "ABA Provider" },
  { value: "PEDIATRICIAN", label: "Pediatrician" },
  { value: "SCHOOL", label: "School" },
  { value: "BILLING_PROVIDER", label: "Billing Provider" },
];

interface Props {
  accountManagers: { id: string; name: string | null; email: string }[];
}

export function OrgForm({ accountManagers }: Props) {
  const router = useRouter();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
  });

  async function onSubmit(data: CreateOrganizationInput) {
    try {
      const res = await fetch("/api/organizations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (json.success) { toast.success("Organization created"); router.push(`/organizations/${json.data.id}`); }
      else toast.error(json.error);
    } catch { toast.error("Failed to create organization"); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Name" htmlFor="name" error={errors.name} required>
              <Input id="name" {...register("name")} placeholder="Organization name" />
            </FormField>
            <FormField label="Type" error={errors.type} required>
              <Select onValueChange={(v) => setValue("type", v as any)}>
                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>
                  {ORG_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Account Manager" error={errors.accountManagerId}>
              <Select onValueChange={(v) => setValue("accountManagerId", v)}>
                <SelectTrigger><SelectValue placeholder="Select account manager..." /></SelectTrigger>
                <SelectContent>
                  {accountManagers.map((am) => (
                    <SelectItem key={am.id} value={am.id}>{am.name ?? am.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Email" htmlFor="email" error={errors.email}>
              <Input id="email" type="email" {...register("email")} placeholder="org@example.com" />
            </FormField>
            <FormField label="Phone" htmlFor="phone" error={errors.phone}>
              <Input id="phone" type="tel" {...register("phone")} placeholder="(555) 123-4567" />
            </FormField>
            <FormField label="Fax" htmlFor="fax" error={errors.fax}>
              <Input id="fax" type="tel" {...register("fax")} placeholder="(555) 123-4568" />
            </FormField>
            <FormField label="Website" htmlFor="website" error={errors.website}>
              <Input id="website" {...register("website")} placeholder="https://example.com" />
            </FormField>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Address</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Address" htmlFor="address" error={errors.address}>
              <Input id="address" {...register("address")} placeholder="123 Main St" />
            </FormField>
            <FormField label="City" htmlFor="city" error={errors.city}>
              <Input id="city" {...register("city")} placeholder="City" />
            </FormField>
            <FormField label="State" htmlFor="state" error={errors.state}>
              <Input id="state" {...register("state")} placeholder="State" />
            </FormField>
            <FormField label="Zip Code" htmlFor="zipCode" error={errors.zipCode}>
              <Input id="zipCode" {...register("zipCode")} placeholder="12345" />
            </FormField>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Identifiers</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="NPI Number" htmlFor="npiNumber" error={errors.npiNumber}>
              <Input id="npiNumber" {...register("npiNumber")} placeholder="1234567890" />
            </FormField>
            <FormField label="Tax ID" htmlFor="taxId" error={errors.taxId}>
              <Input id="taxId" {...register("taxId")} placeholder="12-3456789" />
            </FormField>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Organization"}</Button>
      </div>
    </form>
  );
}
