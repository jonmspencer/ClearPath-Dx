"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@clearpath/ui/components/button";
import { Input } from "@clearpath/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Checkbox } from "@clearpath/ui/components/checkbox";
import { Label } from "@clearpath/ui/components/label";
import { FormField } from "@/components/form-field";
import { updateUserSchema, type UpdateUserInput } from "@/lib/validations/user";

export function UserEditForm({ user }: { user: any }) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver: any = zodResolver(updateUserSchema);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<UpdateUserInput>({
    resolver,
    defaultValues: {
      email: user.email ?? "",
      name: user.name ?? "",
      phone: user.phone ?? "",
      isActive: user.isActive,
    },
  });

  const isActive = watch("isActive");

  async function onSubmit(data: UpdateUserInput) {
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (json.success) { toast.success("User updated"); router.push(`/users/${user.id}`); }
      else toast.error(json.error);
    } catch { toast.error("Failed to update user"); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">User Information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField label="Email" htmlFor="email" error={errors.email}><Input id="email" type="email" {...register("email")} /></FormField>
          <FormField label="Name" htmlFor="name" error={errors.name}><Input id="name" {...register("name")} /></FormField>
          <FormField label="Phone" htmlFor="phone" error={errors.phone}><Input id="phone" {...register("phone")} /></FormField>
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox id="isActive" checked={isActive} onCheckedChange={(checked) => setValue("isActive", checked === true)} />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
      </div>
    </form>
  );
}
