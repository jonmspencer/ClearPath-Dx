"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { Pencil, ArrowRight, Trash2, Plus, UserPlus } from "lucide-react";
import { Button } from "@clearpath/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Badge } from "@clearpath/ui/components/badge";
import { Separator } from "@clearpath/ui/components/separator";
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
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormField } from "@/components/form-field";

interface ClientDetailProps {
  client: any;
}

export function ClientDetailClient({ client }: ClientDetailProps) {
  const router = useRouter();
  const [isAddingGuardian, setIsAddingGuardian] = useState(false);
  const [guardianForm, setGuardianForm] = useState({
    firstName: "",
    lastName: "",
    relationship: "",
    email: "",
    phone: "",
    isPrimary: false,
  });

  async function handleDelete() {
    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Client deleted");
        router.push("/clients");
      } else {
        toast.error(json.error || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleAddGuardian() {
    try {
      const res = await fetch(`/api/clients/${client.id}/guardians`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guardianForm),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Guardian added successfully");
        setIsAddingGuardian(false);
        setGuardianForm({
          firstName: "",
          lastName: "",
          relationship: "",
          email: "",
          phone: "",
          isPrimary: false,
        });
        router.refresh();
      } else {
        toast.error(json.error || "Failed to add guardian");
      }
    } catch {
      toast.error("Failed to add guardian");
    }
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href={`/clients/${client.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Link>
        </Button>
        <div className="flex-1" />
        <ConfirmDialog
          title="Delete Client"
          description="Are you sure you want to delete this client? This will also remove all associated guardians. This action cannot be undone."
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
        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Name" value={`${client.firstName} ${client.lastName}`} />
            {client.preferredName && <InfoRow label="Preferred Name" value={client.preferredName} />}
            <InfoRow label="Date of Birth" value={format(new Date(client.dateOfBirth), "MMM d, yyyy")} />
            <InfoRow label="Gender" value={client.gender ?? "---"} />
            <InfoRow label="Primary Language" value={client.primaryLanguage ?? "---"} />
            <InfoRow label="School" value={client.schoolName ?? "---"} />
            <InfoRow label="Grade" value={client.grade ?? "---"} />
          </CardContent>
        </Card>

        {/* Contact & Insurance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Address & Insurance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Address" value={client.address ?? "---"} />
            <InfoRow
              label="City / State / Zip"
              value={
                [client.city, client.state, client.zipCode].filter(Boolean).join(", ") || "---"
              }
            />
            <Separator />
            <InfoRow label="Insurance Provider" value={client.insuranceProvider ?? "---"} />
            <InfoRow label="Policy ID" value={client.insurancePolicyId ?? "---"} />
            <InfoRow label="Group ID" value={client.insuranceGroupId ?? "---"} />
            <Separator />
            <InfoRow label="Referring Org" value={client.referringOrg?.name ?? "---"} />
            <InfoRow label="Referral #">
              {client.referral ? (
                <Link href={`/referrals/${client.referral.id}`} className="text-sm font-medium text-primary hover:underline">
                  {client.referral.referralNumber}
                </Link>
              ) : (
                <span className="text-sm font-medium">---</span>
              )}
            </InfoRow>
          </CardContent>
        </Card>
      </div>

      {/* Guardians */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Guardians</CardTitle>
          <Dialog open={isAddingGuardian} onOpenChange={setIsAddingGuardian}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserPlus className="mr-2 h-4 w-4" /> Add Guardian
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Guardian</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="First Name" htmlFor="guardianFirstName" required>
                    <Input
                      id="guardianFirstName"
                      value={guardianForm.firstName}
                      onChange={(e) => setGuardianForm((f) => ({ ...f, firstName: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Last Name" htmlFor="guardianLastName" required>
                    <Input
                      id="guardianLastName"
                      value={guardianForm.lastName}
                      onChange={(e) => setGuardianForm((f) => ({ ...f, lastName: e.target.value }))}
                    />
                  </FormField>
                </div>
                <FormField label="Relationship" htmlFor="guardianRelationship" required>
                  <Select
                    onValueChange={(v) => setGuardianForm((f) => ({ ...f, relationship: v }))}
                    value={guardianForm.relationship}
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
                <FormField label="Email" htmlFor="guardianEmail">
                  <Input
                    id="guardianEmail"
                    type="email"
                    value={guardianForm.email}
                    onChange={(e) => setGuardianForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </FormField>
                <FormField label="Phone" htmlFor="guardianPhone">
                  <Input
                    id="guardianPhone"
                    type="tel"
                    value={guardianForm.phone}
                    onChange={(e) => setGuardianForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </FormField>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="guardianIsPrimary"
                    checked={guardianForm.isPrimary}
                    onChange={(e) => setGuardianForm((f) => ({ ...f, isPrimary: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="guardianIsPrimary" className="text-sm">
                    Primary Guardian
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddingGuardian(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddGuardian}>Add Guardian</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {client.guardians?.length > 0 ? (
            <div className="space-y-3">
              {client.guardians.map((guardian: any) => (
                <div key={guardian.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {guardian.firstName} {guardian.lastName}
                      </p>
                      {guardian.isPrimary && <Badge variant="secondary">Primary</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {guardian.relationship.replace(/_/g, " ")}
                      {guardian.email && ` | ${guardian.email}`}
                      {guardian.phone && ` | ${guardian.phone}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No guardians recorded.</p>
          )}
        </CardContent>
      </Card>

      {/* Diagnostic Cases */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Diagnostic Cases</CardTitle>
        </CardHeader>
        <CardContent>
          {client.diagnosticCases?.length > 0 ? (
            <div className="space-y-2">
              {client.diagnosticCases.map((dc: any) => (
                <div key={dc.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">Case: {dc.caseNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(dc.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={dc.status} type="case" />
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/cases/${dc.id}`}>
                        View <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No diagnostic cases linked.</p>
          )}
        </CardContent>
      </Card>

      {/* Care Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Care Coordination Flags</CardTitle>
        </CardHeader>
        <CardContent>
          {client.careFlags?.length > 0 ? (
            <div className="space-y-2">
              {client.careFlags.map((flag: any) => (
                <div key={flag.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{flag.flagType.replace(/_/g, " ")}</p>
                      <Badge
                        variant={
                          flag.severity === "HIGH"
                            ? "destructive"
                            : flag.severity === "MEDIUM"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {flag.severity}
                      </Badge>
                    </div>
                    {flag.description && (
                      <p className="text-xs text-muted-foreground">{flag.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(flag.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <StatusBadge status={flag.status} type="flag" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No care coordination flags.</p>
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
