"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Shield, Building2, Activity } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@clearpath/ui/components/button";
import { Badge } from "@clearpath/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@clearpath/ui/components/select";
import { Checkbox } from "@clearpath/ui/components/checkbox";
import { Label } from "@clearpath/ui/components/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger,
} from "@clearpath/ui/components/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormField } from "@/components/form-field";
import { assignRoleSchema, type AssignRoleInput } from "@/lib/validations/user";

const USER_ROLES = [
  "SUPER_ADMIN", "FINANCE_ADMIN", "ADMIN", "INTAKE_COORDINATOR", "SCHEDULER",
  "ACCOUNT_MANAGER", "COMMUNITY_DEVELOPMENT_MANAGER", "PSYCHOLOGIST", "PSYCHOMETRIST",
  "ABA_PROVIDER_ADMIN", "ABA_PROVIDER_STAFF", "PEDIATRICIAN_ADMIN", "PARENT_GUARDIAN",
];

function formatRole(role: string) {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Props {
  user: any;
  organizations: { id: string; name: string }[];
}

export function UserDetailClient({ user, organizations }: Props) {
  const router = useRouter();
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolver: any = zodResolver(assignRoleSchema);
  const { setValue, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<AssignRoleInput>({
    resolver,
  });

  async function handleDeactivate() {
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { toast.success("User deactivated"); router.refresh(); }
      else toast.error(json.error);
    } catch { toast.error("Failed to deactivate user"); }
  }

  async function onAssignRole(data: AssignRoleInput) {
    try {
      const res = await fetch(`/api/users/${user.id}/roles`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) { toast.success("Role assigned"); setRoleDialogOpen(false); reset(); router.refresh(); }
      else toast.error(json.error);
    } catch { toast.error("Failed to assign role"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild><Link href={`/users/${user.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> Edit</Link></Button>
        <div className="flex-1" />
        {user.isActive && (
          <ConfirmDialog title="Deactivate User" description="This will deactivate this user account. They will no longer be able to sign in." confirmLabel="Deactivate" variant="destructive" onConfirm={handleDeactivate}>
            <Button variant="outline" size="sm" className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Deactivate</Button>
          </ConfirmDialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">User Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Name" value={user.name} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Phone" value={user.phone} />
            <InfoRow label="Status">
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </InfoRow>
            {user.emailVerified && <InfoRow label="Email Verified" value={format(new Date(user.emailVerified), "MMM d, yyyy")} />}
            <InfoRow label="Created" value={format(new Date(user.createdAt), "MMM d, yyyy")} />
            <InfoRow label="Updated" value={format(new Date(user.updatedAt), "MMM d, yyyy")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Organization Memberships</CardTitle>
              <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" /> Add Role</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Role</DialogTitle>
                    <DialogDescription>Add an organization membership and role for this user.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onAssignRole)} className="space-y-4">
                    <FormField label="Organization" error={errors.organizationId} required>
                      <Select onValueChange={(v) => setValue("organizationId", v)}>
                        <SelectTrigger><SelectValue placeholder="Select organization..." /></SelectTrigger>
                        <SelectContent>{organizations.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Role" error={errors.role} required>
                      <Select onValueChange={(v) => setValue("role", v as any)}>
                        <SelectTrigger><SelectValue placeholder="Select role..." /></SelectTrigger>
                        <SelectContent>{USER_ROLES.map((r) => <SelectItem key={r} value={r}>{formatRole(r)}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormField>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="isPrimary" onCheckedChange={(checked) => setValue("isPrimary", checked === true)} />
                      <Label htmlFor="isPrimary">Primary membership</Label>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Assigning..." : "Assign Role"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {user.organizationMemberships.length === 0 ? (
              <p className="text-sm text-muted-foreground">No organization memberships.</p>
            ) : (
              <div className="space-y-3">
                {user.organizationMemberships.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between rounded-md border p-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{m.organization.name}</span>
                        {m.isPrimary && <Badge variant="default" className="text-xs">Primary</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">{formatRole(m.role)}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {user.providerProfile && (
        <Card>
          <CardHeader><CardTitle className="text-base">Provider Profile</CardTitle></CardHeader>
          <CardContent>
            <Link href={`/providers/${user.providerProfile.id}`} className="text-sm text-primary hover:underline">
              View Provider Profile
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Activity Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-md border p-3">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{user._count.assignedCases}</p>
                <p className="text-xs text-muted-foreground">Assigned Cases</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border p-3">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{user._count.scheduledCases}</p>
                <p className="text-xs text-muted-foreground">Scheduled Cases</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border p-3">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{user._count.auditLogs}</p>
                <p className="text-xs text-muted-foreground">Audit Logs</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children || <span className="text-sm font-medium">{value ?? "—"}</span>}
    </div>
  );
}
