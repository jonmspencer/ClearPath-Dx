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
import { FormField } from "@/components/form-field";
import { updateProviderSchema, type UpdateProviderInput } from "@/lib/validations/provider";

export function ProviderEditForm({ provider }: { provider: any }) {
  const router = useRouter();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<UpdateProviderInput>({
    resolver: zodResolver(updateProviderSchema),
    defaultValues: {
      providerType: provider.providerType,
      licenseNumber: provider.licenseNumber ?? "",
      licenseState: provider.licenseState ?? "",
      npiNumber: provider.npiNumber ?? "",
      yearsExperience: provider.yearsExperience ?? undefined,
      bio: provider.bio ?? "",
      maxWeeklyCases: provider.maxWeeklyCases,
      isAcceptingCases: provider.isAcceptingCases,
      serviceRadius: provider.serviceRadius ?? undefined,
      specialties: provider.specialties ?? [],
      serviceZipCodes: provider.serviceZipCodes ?? [],
    },
  });

  async function onSubmit(data: UpdateProviderInput) {
    try {
      const res = await fetch(`/api/providers/${provider.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (json.success) { toast.success("Provider updated"); router.push(`/providers/${provider.id}`); }
      else toast.error(json.error);
    } catch { toast.error("Failed to update"); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Provider Type</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Provider Type" error={errors.providerType}>
              <Select defaultValue={provider.providerType} onValueChange={(v) => setValue("providerType", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Input id="licenseNumber" {...register("licenseNumber")} />
            </FormField>
            <FormField label="License State" htmlFor="licenseState" error={errors.licenseState}>
              <Input id="licenseState" {...register("licenseState")} />
            </FormField>
            <FormField label="NPI Number" htmlFor="npiNumber" error={errors.npiNumber}>
              <Input id="npiNumber" {...register("npiNumber")} />
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
              <Select defaultValue={String(provider.isAcceptingCases)} onValueChange={(v) => setValue("isAcceptingCases", v === "true")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
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
                defaultValue={provider.serviceZipCodes?.join(", ") ?? ""}
                onChange={(e) => {
                  const zips = e.target.value.split(",").map((z: string) => z.trim()).filter(Boolean);
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
              defaultValue={provider.specialties?.join(", ") ?? ""}
              onChange={(e) => {
                const items = e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean);
                setValue("specialties", items);
              }}
            />
          </FormField>
          <FormField label="Bio" htmlFor="bio" error={errors.bio}>
            <Textarea id="bio" rows={3} {...register("bio")} />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
      </div>
    </form>
  );
}
