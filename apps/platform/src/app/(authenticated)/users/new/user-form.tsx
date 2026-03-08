"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@clearpath/ui/components/select";
import { Checkbox } from "@clearpath/ui/components/checkbox";
import { Label } from "@clearpath/ui/components/label";
import { FormField } from "@/components/form-field";
import { createUserSchema, type CreateUserInput } from "@/lib/validations/user";

const USER_ROLES = [
  "SUPER_ADMIN", "FINANCE_ADMIN", "ADMIN", "INTAKE_COORDINATOR", "SCHEDULER",
  "ACCOUNT_MANAGER", "COMMUNITY_DEVELOPMENT_MANAGER", "PSYCHOLOGIST", "PSYCHOMETRIST",
  "ABA_PROVIDER_ADMIN", "ABA_PROVIDER_STAFF", "PEDIATRICIAN_ADMIN", "PARENT_GUARDIAN",
];

function formatRole(role: string) {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Props {
  organizations: { id: string; name: string }[];
}

export function UserForm({ organizations }: Props) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver: any = zodResolver(createUserSchema);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<CreateUserInput>({
    resolver,
    defaultValues: { isPrimary: true },
  });

  async function onSubmit(data: CreateUserInput) {
    try {
      const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (json.success) { toast.success("User created"); router.push(`/users/${json.data.id}`); }
      else toast.error(json.error);
    } catch { toast.error("Failed to create user"); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Account Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Email" htmlFor="email" error={errors.email} required><Input id="email" type="email" {...register("email")} placeholder="user@example.com" /></FormField>
            <FormField label="Name" htmlFor="name" error={errors.name}><Input id="name" {...register("name")} placeholder="Full name" /></FormField>
            <FormField label="Phone" htmlFor="phone" error={errors.phone}><Input id="phone" {...register("phone")} placeholder="(555) 123-4567" /></FormField>
            <FormField label="Password" htmlFor="password" error={errors.password} required><Input id="password" type="password" {...register("password")} placeholder="Minimum 8 characters" /></FormField>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Initial Organization Assignment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Organization" error={errors.organizationId}>
              <Select onValueChange={(v) => setValue("organizationId", v)}>
                <SelectTrigger><SelectValue placeholder="Select organization..." /></SelectTrigger>
                <SelectContent>{organizations.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Role" error={errors.role}>
              <Select onValueChange={(v) => setValue("role", v as any)}>
                <SelectTrigger><SelectValue placeholder="Select role..." /></SelectTrigger>
                <SelectContent>{USER_ROLES.map((r) => <SelectItem key={r} value={r}>{formatRole(r)}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <div className="flex items-center space-x-2">
              <Checkbox id="isPrimary" defaultChecked onCheckedChange={(checked) => setValue("isPrimary", checked === true)} />
              <Label htmlFor="isPrimary">Primary membership</Label>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create User"}</Button>
      </div>
    </form>
  );
}
