"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@clearpath/ui/components/tabs";
import { FormField } from "@/components/form-field";
import {
  updateOrgSettingsSchema, updateProfileSchema,
  type UpdateOrgSettingsInput, type UpdateProfileInput,
} from "@/lib/validations/settings";

export function SettingsClient() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "profile" ? "profile" : "organization";
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="organization">Organization</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
      </TabsList>
      <TabsContent value="organization" className="mt-6">
        <OrganizationSettings />
      </TabsContent>
      <TabsContent value="profile" className="mt-6">
        <ProfileSettings />
      </TabsContent>
    </Tabs>
  );
}

function OrganizationSettings() {
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UpdateOrgSettingsInput>({
    resolver: zodResolver(updateOrgSettingsSchema),
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const json = await res.json();
        if (json.success && json.data) {
          reset({
            name: json.data.name || "",
            phone: json.data.phone || "",
            fax: json.data.fax || "",
            email: json.data.email || "",
            address: json.data.address || "",
            city: json.data.city || "",
            state: json.data.state || "",
            zipCode: json.data.zipCode || "",
            website: json.data.website || "",
          });
        }
      } catch { toast.error("Failed to load organization settings"); }
      setIsLoadingData(false);
    }
    loadSettings();
  }, [reset]);

  async function onSubmit(data: UpdateOrgSettingsInput) {
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) { toast.success("Organization settings updated"); }
      else toast.error(json.error);
    } catch { toast.error("Failed to update organization settings"); }
  }

  if (isLoadingData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">General Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Organization Name" htmlFor="name" error={errors.name}>
              <Input id="name" {...register("name")} />
            </FormField>
            <FormField label="Email" htmlFor="email" error={errors.email}>
              <Input id="email" type="email" {...register("email")} />
            </FormField>
            <FormField label="Phone" htmlFor="phone" error={errors.phone}>
              <Input id="phone" {...register("phone")} />
            </FormField>
            <FormField label="Fax" htmlFor="fax" error={errors.fax}>
              <Input id="fax" {...register("fax")} />
            </FormField>
            <FormField label="Website" htmlFor="website" error={errors.website}>
              <Input id="website" {...register("website")} placeholder="https://..." />
            </FormField>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Address</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Street Address" htmlFor="address" error={errors.address}>
              <Input id="address" {...register("address")} />
            </FormField>
            <FormField label="City" htmlFor="city" error={errors.city}>
              <Input id="city" {...register("city")} />
            </FormField>
            <FormField label="State" htmlFor="state" error={errors.state}>
              <Input id="state" {...register("state")} />
            </FormField>
            <FormField label="ZIP Code" htmlFor="zipCode" error={errors.zipCode}>
              <Input id="zipCode" {...register("zipCode")} />
            </FormField>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
      </div>
    </form>
  );
}

function ProfileSettings() {
  const { update: updateSession } = useSession();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [email, setEmail] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/settings/profile");
        const json = await res.json();
        if (json.success && json.data) {
          reset({
            name: json.data.name || "",
            phone: json.data.phone || "",
          });
          setEmail(json.data.email || "");
        }
      } catch { toast.error("Failed to load profile"); }
      setIsLoadingData(false);
    }
    loadProfile();
  }, [reset]);

  async function onSubmit(data: UpdateProfileInput) {
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Profile updated");
        await updateSession({});
      } else toast.error(json.error);
    } catch { toast.error("Failed to update profile"); }
  }

  if (isLoadingData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Your Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Name" htmlFor="profileName" error={errors.name}>
            <Input id="profileName" {...register("name")} />
          </FormField>
          <FormField label="Email" htmlFor="profileEmail">
            <Input id="profileEmail" value={email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed here. Contact an administrator.</p>
          </FormField>
          <FormField label="Phone" htmlFor="profilePhone" error={errors.phone}>
            <Input id="profilePhone" {...register("phone")} />
          </FormField>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Profile"}</Button>
      </div>
    </form>
  );
}
