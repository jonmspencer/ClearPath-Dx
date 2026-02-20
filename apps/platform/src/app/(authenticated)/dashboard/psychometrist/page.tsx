import { auth } from "@clearpath/auth";
import { prisma } from "@clearpath/database";
import { redirect } from "next/navigation";
import { Briefcase, Calendar, Clock } from "lucide-react";
import { PageContainer } from "@/components/page-container";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Badge } from "@clearpath/ui/components/badge";

export default async function PsychometristDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const profile = await prisma.providerProfile.findUnique({ where: { userId: session.user.id } });

  if (!profile) {
    return (
      <PageContainer title="Provider Dashboard" description="Your cases, testing sessions, and availability">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No provider profile found. Contact an administrator.</p></CardContent></Card>
      </PageContainer>
    );
  }

  const now = new Date();
  const [assignedCases, upcomingInterviews, availabilitySlots] = await Promise.all([
    prisma.diagnosticCase.count({ where: { psychometristId: profile.id } }),
    prisma.interviewEvent.count({ where: { providerId: profile.id, scheduledStart: { gte: now }, isCancelled: false, isCompleted: false } }),
    prisma.providerAvailability.count({ where: { providerId: profile.id } }),
  ]);

  return (
    <PageContainer title="Provider Dashboard" description="Your cases, testing sessions, and availability">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Assigned Cases" value={assignedCases} icon={<Briefcase className="h-5 w-5" />} />
        <StatCard title="Upcoming Sessions" value={upcomingInterviews} icon={<Calendar className="h-5 w-5" />} />
        <StatCard title="Availability Slots" value={availabilitySlots} icon={<Clock className="h-5 w-5" />} />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Capacity</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Weekly Cases</span>
            <span className="font-medium">{profile.currentWeeklyCases} / {profile.maxWeeklyCases}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Accepting Cases</span>
            <Badge variant={profile.isAcceptingCases ? "default" : "secondary"}>{profile.isAcceptingCases ? "Yes" : "No"}</Badge>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
