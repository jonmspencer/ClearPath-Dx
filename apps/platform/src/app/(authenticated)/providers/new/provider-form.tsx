"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Textarea } from "@clearpath/ui/components/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@clearpath/ui/components/select";
import { Switch } from "@clearpath/ui/components/switch";
import { FormField } from "@/components/form-field";
import { createProviderSchema, type CreateProviderInput } from "@/lib/validations/provider";

interface Props {
  users: { id: string; name: string | null; email: string }[];
  organizations: { id: string; name: string }[];
}

export function ProviderForm({ users, organizations }: Props) {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<CreateProviderInput>({
    resolver: zodResolver(createProviderSchema),
    defaultValues: {
      specialties: [],
      serviceZipCodes: [],
      maxWeeklyCases: 5,
      isAcceptingCases: true,
    },
  });

  async function onSubmit(data: CreateProviderInput) {
    try {
      const res = await fetch("/api/providers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (json.success) { toast.success("Provider created"); router.push(`/providers/${json.data.id}`); }
      else toast.error(json.error);
    } catch { toast.error("Failed to create provider"); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">User & Organization</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="User" error={errors.userId} required>
              <Select onValueChange={(v) => setValue("userId", v)}>
                <SelectTrigger><SelectValue placeholder="Select user..." /></SelectTrigger>
                <SelectContent>{users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name ?? u.email}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Organization" error={errors.organizationId} required>
              <Select onValueChange={(v) => setValue("organizationId", v)}>
                <SelectTrigger><SelectValue placeholder="Select organization..." /></SelectTrigger>
                <SelectContent>{organizations.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Provider Type" error={errors.providerType} required>
              <Select onValueChange={(v) => setValue("providerType", v as any)}>
                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PSYCHOLOGIST">Psychologist</SelectItem>
                  <SelectItem value="PSYCHOMETRIST">Psychometrist</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">License & Credentials</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="License Number" htmlFor="licenseNumber" error={errors.licenseNumber}>
              <Input id="licenseNumber" {...register("licenseNumber")} placeholder="e.g. PSY-12345" />
            </FormField>
            <FormField label="License State" htmlFor="licenseState" error={errors.licenseState}>
              <Input id="licenseState" {...register("licenseState")} placeholder="e.g. CA" />
            </FormField>
            <FormField label="NPI Number" htmlFor="npiNumber" error={errors.npiNumber}>
              <Input id="npiNumber" {...register("npiNumber")} placeholder="e.g. 1234567890" />
            </FormField>
            <FormField label="Years of Experience" htmlFor="yearsExperience" error={errors.yearsExperience}>
              <Input id="yearsExperience" type="number" {...register("yearsExperience")} />
            </FormField>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Capacity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Max Weekly Cases" htmlFor="maxWeeklyCases" error={errors.maxWeeklyCases}>
              <Input id="maxWeeklyCases" type="number" {...register("maxWeeklyCases")} />
            </FormField>
            <FormField label="Accepting Cases" error={errors.isAcceptingCases}>
              <div className="flex items-center gap-2">
                <Switch
                  checked={watch("isAcceptingCases")}
                  onCheckedChange={(checked) => setValue("isAcceptingCases", checked === true)}
                />
                <span className="text-sm text-muted-foreground">
                  {watch("isAcceptingCases") ? "Yes" : "No"}
                </span>
              </div>
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Service Area</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Service Radius (miles)" htmlFor="serviceRadius" error={errors.serviceRadius}>
              <Input id="serviceRadius" type="number" {...register("serviceRadius")} />
            </FormField>
            <FormField label="Service Zip Codes (comma-separated)" htmlFor="serviceZipCodes">
              <Input
                id="serviceZipCodes"
                placeholder="e.g. 90210, 90211, 90212"
                onChange={(e) => {
                  const zips = e.target.value.split(",").map((z) => z.trim()).filter(Boolean);
                  setValue("serviceZipCodes", zips);
                }}
              />
            </FormField>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Specialties (comma-separated)" htmlFor="specialties">
            <Input
              id="specialties"
              placeholder="e.g. ADHD, Autism, Learning Disabilities"
              onChange={(e) => {
                const items = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                setValue("specialties", items);
              }}
            />
          </FormField>
          <FormField label="Bio" htmlFor="bio" error={errors.bio}>
            <Textarea id="bio" rows={3} {...register("bio")} placeholder="Brief professional bio..." />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Provider"}</Button>
      </div>
    </form>
  );
}
