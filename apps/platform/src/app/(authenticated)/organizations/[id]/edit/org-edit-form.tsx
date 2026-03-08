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
import { updateOrganizationSchema, type UpdateOrganizationInput } from "@/lib/validations/organization";

const ORG_TYPES = [
  { value: "DIAGNOSTICS_OPERATOR", label: "Diagnostics Operator" },
  { value: "ABA_PROVIDER", label: "ABA Provider" },
  { value: "PEDIATRICIAN", label: "Pediatrician" },
  { value: "SCHOOL", label: "School" },
  { value: "BILLING_PROVIDER", label: "Billing Provider" },
];

interface Props {
  organization: any;
  accountManagers: { id: string; name: string | null; email: string }[];
}

export function OrgEditForm({ organization, accountManagers }: Props) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver: any = zodResolver(updateOrganizationSchema);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<UpdateOrganizationInput>({
    resolver,
    defaultValues: {
      name: organization.name ?? "",
      type: organization.type,
      phone: organization.phone ?? "",
      fax: organization.fax ?? "",
      email: organization.email ?? "",
      address: organization.address ?? "",
      city: organization.city ?? "",
      state: organization.state ?? "",
      zipCode: organization.zipCode ?? "",
      website: organization.website ?? "",
      npiNumber: organization.npiNumber ?? "",
      taxId: organization.taxId ?? "",
      accountManagerId: organization.accountManagerId ?? "",
    },
  });

  async function onSubmit(data: UpdateOrganizationInput) {
    try {
      const res = await fetch(`/api/organizations/${organization.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (json.success) { toast.success("Organization updated"); router.push(`/organizations/${organization.id}`); }
      else toast.error(json.error);
    } catch { toast.error("Failed to update"); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Name" htmlFor="name" error={errors.name} required>
              <Input id="name" {...register("name")} />
            </FormField>
            <FormField label="Type" error={errors.type}>
              <Select defaultValue={organization.type} onValueChange={(v) => setValue("type", v as any)}>
                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>
                  {ORG_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Account Manager" error={errors.accountManagerId}>
              <Select defaultValue={organization.accountManagerId ?? ""} onValueChange={(v) => setValue("accountManagerId", v)}>
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
              <Input id="email" type="email" {...register("email")} />
            </FormField>
            <FormField label="Phone" htmlFor="phone" error={errors.phone}>
              <Input id="phone" type="tel" {...register("phone")} />
            </FormField>
            <FormField label="Fax" htmlFor="fax" error={errors.fax}>
              <Input id="fax" type="tel" {...register("fax")} />
            </FormField>
            <FormField label="Website" htmlFor="website" error={errors.website}>
              <Input id="website" {...register("website")} />
            </FormField>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Address</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Address" htmlFor="address" error={errors.address}>
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
        <Card>
          <CardHeader><CardTitle className="text-base">Identifiers</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="NPI Number" htmlFor="npiNumber" error={errors.npiNumber}>
              <Input id="npiNumber" {...register("npiNumber")} />
            </FormField>
            <FormField label="Tax ID" htmlFor="taxId" error={errors.taxId}>
              <Input id="taxId" {...register("taxId")} />
            </FormField>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
      </div>
    </form>
  );
}
