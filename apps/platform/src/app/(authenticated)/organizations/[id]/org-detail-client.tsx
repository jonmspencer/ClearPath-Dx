"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { Pencil, Trash2, UserPlus, Power } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Badge } from "@clearpath/ui/components/badge";
import { Input } from "@clearpath/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@clearpath/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@clearpath/ui/components/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormField } from "@/components/form-field";

const ORG_TYPE_LABELS: Record<string, string> = {
  DIAGNOSTICS_OPERATOR: "Diagnostics Operator",
  ABA_PROVIDER: "ABA Provider",
  PEDIATRICIAN: "Pediatrician",
  SCHOOL: "School",
  BILLING_PROVIDER: "Billing Provider",
};

const USER_ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  FINANCE_ADMIN: "Finance Admin",
  ADMIN: "Admin",
  INTAKE_COORDINATOR: "Intake Coordinator",
  SCHEDULER: "Scheduler",
  ACCOUNT_MANAGER: "Account Manager",
  COMMUNITY_DEVELOPMENT_MANAGER: "Community Dev Manager",
  PSYCHOLOGIST: "Psychologist",
  PSYCHOMETRIST: "Psychometrist",
  ABA_PROVIDER_ADMIN: "ABA Provider Admin",
  ABA_PROVIDER_STAFF: "ABA Provider Staff",
  PEDIATRICIAN_ADMIN: "Pediatrician Admin",
  PARENT_GUARDIAN: "Parent/Guardian",
};

export function OrgDetailClient({ organization }: { organization: any }) {
  const router = useRouter();
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberForm, setMemberForm] = useState({
    userId: "",
    role: "",
    isPrimary: false,
  });

  async function handleDelete() {
    try {
      const res = await fetch(`/api/organizations/${organization.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { toast.success("Organization deleted"); router.push("/organizations"); }
      else toast.error(json.error);
    } catch { toast.error("Failed to delete"); }
  }

  async function handleToggleActive() {
    try {
      const res = await fetch(`/api/organizations/${organization.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !organization.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(organization.isActive ? "Organization deactivated" : "Organization activated");
        router.refresh();
      } else toast.error(json.error);
    } catch { toast.error("Failed to update"); }
  }

  async function handleAddMember() {
    try {
      const res = await fetch(`/api/organizations/${organization.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberForm),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Member added successfully");
        setIsAddingMember(false);
        setMemberForm({ userId: "", role: "", isPrimary: false });
        router.refresh();
      } else {
        toast.error(json.error || "Failed to add member");
      }
    } catch {
      toast.error("Failed to add member");
    }
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href={`/organizations/${organization.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Link>
        </Button>
        <ConfirmDialog
          title={organization.isActive ? "Deactivate Organization" : "Activate Organization"}
          description={organization.isActive
            ? "This will deactivate the organization. Members will not be able to access it."
            : "This will reactivate the organization."
          }
          confirmLabel={organization.isActive ? "Deactivate" : "Activate"}
          variant={organization.isActive ? "destructive" : "default"}
          onConfirm={handleToggleActive}
        >
          <Button variant="outline" size="sm">
            <Power className="mr-2 h-4 w-4" /> {organization.isActive ? "Deactivate" : "Activate"}
          </Button>
        </ConfirmDialog>
        <div className="flex-1" />
        <ConfirmDialog
          title="Delete Organization"
          description="This will permanently delete this organization and all associated data. This action cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDelete}
        >
          <Button variant="outline" size="sm" className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </ConfirmDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Organization Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Type" value={ORG_TYPE_LABELS[organization.type] ?? organization.type} />
            <InfoRow label="Status">
              <Badge variant={organization.isActive ? "default" : "secondary"}>
                {organization.isActive ? "Active" : "Inactive"}
              </Badge>
            </InfoRow>
            <InfoRow label="Email" value={organization.email} />
            <InfoRow label="Phone" value={organization.phone} />
            <InfoRow label="Fax" value={organization.fax} />
            <InfoRow label="Website" value={organization.website} />
            <InfoRow label="NPI Number" value={organization.npiNumber} />
            <InfoRow label="Tax ID" value={organization.taxId} />
            <InfoRow label="Account Manager" value={organization.accountManager?.name} />
          </CardContent>
        </Card>

        {/* Address & Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Address & Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Address" value={organization.address} />
            <InfoRow
              label="City / State / Zip"
              value={[organization.city, organization.state, organization.zipCode].filter(Boolean).join(", ") || null}
            />
            <div className="my-2 border-t" />
            <InfoRow label="Total Members" value={String(organization.members?.length ?? 0)} />
            <InfoRow label="Total Referrals" value={String(organization._count?.referrals ?? 0)} />
            <InfoRow label="Total Clients" value={String(organization._count?.clients ?? 0)} />
            <InfoRow label="Billing Records" value={String(organization._count?.billingRecords ?? 0)} />
            <InfoRow label="Created" value={format(new Date(organization.createdAt), "MMM d, yyyy")} />
          </CardContent>
        </Card>
      </div>

      {/* Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Members</CardTitle>
          <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserPlus className="mr-2 h-4 w-4" /> Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <FormField label="User ID" htmlFor="memberUserId" required>
                  <Input
                    id="memberUserId"
                    placeholder="Enter user ID..."
                    value={memberForm.userId}
                    onChange={(e) => setMemberForm((f) => ({ ...f, userId: e.target.value }))}
                  />
                </FormField>
                <FormField label="Role" htmlFor="memberRole" required>
                  <Select
                    onValueChange={(v) => setMemberForm((f) => ({ ...f, role: v }))}
                    value={memberForm.role}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="memberIsPrimary"
                    checked={memberForm.isPrimary}
                    onChange={(e) => setMemberForm((f) => ({ ...f, isPrimary: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="memberIsPrimary" className="text-sm">
                    Primary Member
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddingMember(false)}>Cancel</Button>
                  <Button onClick={handleAddMember}>Add Member</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {organization.members?.length > 0 ? (
            <div className="space-y-3">
              {organization.members.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{member.user.name ?? member.user.email}</p>
                      {member.isPrimary && <Badge variant="secondary">Primary</Badge>}
                      {!member.isActive && <Badge variant="outline">Inactive</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {USER_ROLE_LABELS[member.role] ?? member.role}
                      {member.user.email && ` | ${member.user.email}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No members in this organization.</p>
          )}
        </CardContent>
      </Card>

      {/* Referral Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Referral Sources</CardTitle>
        </CardHeader>
        <CardContent>
          {organization.referralSources?.length > 0 ? (
            <div className="space-y-2">
              {organization.referralSources.map((source: any) => (
                <div key={source.id} className="flex items-center justify-between rounded-md border p-3">
                  <p className="text-sm font-medium">{source.name}</p>
                  <Badge variant={source.isActive ? "default" : "secondary"}>
                    {source.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No referral sources configured.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children || <span className="text-sm font-medium">{value ?? "---"}</span>}
    </div>
  );
}
