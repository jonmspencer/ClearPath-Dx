"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@clearpath/ui/components/badge";
import { Button } from "@clearpath/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { ConfirmDialog } from "@/components/confirm-dialog";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  PSYCHOLOGIST: { label: "Psychologist", className: "bg-purple-100 text-purple-800 border-0" },
  PSYCHOMETRIST: { label: "Psychometrist", className: "bg-blue-100 text-blue-800 border-0" },
};

export function ProviderDetailClient({ provider }: { provider: any }) {
  const router = useRouter();

  async function handleDelete() {
    try {
      const res = await fetch(`/api/providers/${provider.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { toast.success("Provider deleted"); router.push("/providers"); }
      else toast.error(json.error);
    } catch { toast.error("Failed to delete"); }
  }

  const allCases = [...(provider.casesAsPsych || []), ...(provider.casesAsPsychom || [])];
  const totalCases = (provider._count?.casesAsPsych || 0) + (provider._count?.casesAsPsychom || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href={`/providers/${provider.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> Edit</Link>
        </Button>
        <div className="flex-1" />
        <ConfirmDialog
          title="Delete Provider"
          description="This will permanently delete this provider profile. This action cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDelete}
        >
          <Button variant="outline" size="sm" className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
        </ConfirmDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Provider Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Name" value={provider.user.name ?? provider.user.email} />
            <InfoRow label="Email" value={provider.user.email} />
            <InfoRow label="Type">
              {(() => {
                const config = TYPE_BADGE[provider.providerType];
                return config ? (
                  <Badge variant="outline" className={config.className}>{config.label}</Badge>
                ) : (
                  <Badge variant="outline">{provider.providerType}</Badge>
                );
              })()}
            </InfoRow>
            <InfoRow label="Organization" value={provider.organization.name} />
            <InfoRow label="License #" value={provider.licenseNumber} />
            <InfoRow label="License State" value={provider.licenseState} />
            <InfoRow label="NPI" value={provider.npiNumber} />
            <InfoRow label="Years Experience" value={provider.yearsExperience != null ? String(provider.yearsExperience) : null} />
            {provider.specialties?.length > 0 && (
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Specialties</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                  {provider.specialties.map((s: string) => (
                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Capacity & Coverage</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Weekly Cases" value={`${provider.currentWeeklyCases}/${provider.maxWeeklyCases}`} />
            <InfoRow label="Accepting Cases">
              <Badge variant="outline" className={provider.isAcceptingCases ? "bg-green-100 text-green-800 border-0" : "bg-gray-100 text-gray-600 border-0"}>
                {provider.isAcceptingCases ? "Yes" : "No"}
              </Badge>
            </InfoRow>
            <InfoRow label="Total Cases" value={String(totalCases)} />
            <InfoRow label="Total Interviews" value={String(provider._count?.interviews || 0)} />
            <InfoRow label="Service Radius" value={provider.serviceRadius != null ? `${provider.serviceRadius} miles` : null} />
            {provider.serviceZipCodes?.length > 0 && (
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Service Zip Codes</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                  {provider.serviceZipCodes.map((z: string) => (
                    <Badge key={z} variant="outline" className="text-xs">{z}</Badge>
                  ))}
                </div>
              </div>
            )}
            <InfoRow label="Created" value={format(new Date(provider.createdAt), "MMM d, yyyy")} />
          </CardContent>
        </Card>
      </div>

      {provider.bio && (
        <Card>
          <CardHeader><CardTitle className="text-base">Bio</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{provider.bio}</p></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Availability</CardTitle></CardHeader>
        <CardContent>
          {provider.availability?.length > 0 ? (
            <div className="space-y-2">
              {provider.availability.map((slot: any) => (
                <div key={slot.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="text-sm font-medium">{DAY_LABELS[slot.dayOfWeek] || slot.dayOfWeek}</span>
                  <span className="text-sm text-muted-foreground">
                    {slot.startTime} — {slot.endTime}
                    {!slot.isRecurring && slot.specificDate && ` (${format(new Date(slot.specificDate), "MMM d, yyyy")})`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No availability slots configured.</p>
          )}
        </CardContent>
      </Card>

      {allCases.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Assigned Cases</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allCases.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <Link href={`/cases/${c.id}`} className="text-sm font-medium text-primary hover:underline">
                    {c.caseNumber}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {c.client.firstName} {c.client.lastName}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children || <span className="text-sm font-medium">{value ?? "\u2014"}</span>}
    </div>
  );
}
