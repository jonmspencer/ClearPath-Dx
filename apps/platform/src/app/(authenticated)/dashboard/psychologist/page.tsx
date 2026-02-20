import { auth } from "@clearpath/auth";
import { prisma } from "@clearpath/database";
import { redirect } from "next/navigation";
import { Briefcase, Calendar, FileText, DollarSign } from "lucide-react";
import { PageContainer } from "@/components/page-container";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Badge } from "@clearpath/ui/components/badge";

export default async function PsychologistDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const profile = await prisma.providerProfile.findUnique({ where: { userId: session.user.id } });

  if (!profile) {
    return (
      <PageContainer title="Provider Dashboard" description="Your cases, interviews, and reports">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No provider profile found. Contact an administrator.</p></CardContent></Card>
      </PageContainer>
    );
  }

  const now = new Date();
  const [assignedCases, upcomingInterviews, draftReports, pendingPayouts] = await Promise.all([
    prisma.diagnosticCase.count({ where: { OR: [{ psychologistId: profile.id }, { psychometristId: profile.id }] } }),
    prisma.interviewEvent.count({ where: { providerId: profile.id, scheduledStart: { gte: now }, isCancelled: false, isCompleted: false } }),
    prisma.diagnosticReport.count({ where: { authorId: profile.id, status: "DRAFT" } }),
    prisma.providerPayoutLedger.count({ where: { providerId: profile.id, status: "PENDING" } }),
  ]);

  return (
    <PageContainer title="Provider Dashboard" description="Your cases, interviews, and reports">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Assigned Cases" value={assignedCases} icon={<Briefcase className="h-5 w-5" />} />
        <StatCard title="Upcoming Interviews" value={upcomingInterviews} icon={<Calendar className="h-5 w-5" />} />
        <StatCard title="Draft Reports" value={draftReports} icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Pending Payouts" value={pendingPayouts} icon={<DollarSign className="h-5 w-5" />} />
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
