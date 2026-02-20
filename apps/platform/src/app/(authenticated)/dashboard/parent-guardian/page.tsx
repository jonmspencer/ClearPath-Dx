import { auth } from "@clearpath/auth";
import { prisma } from "@clearpath/database";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { PageContainer } from "@/components/page-container";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { Calendar, ClipboardCheck } from "lucide-react";

export default async function ParentGuardianDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const guardian = await prisma.guardian.findUnique({ where: { userId: session.user.id } });

  if (!guardian) {
    return (
      <PageContainer title="My Child&apos;s Progress" description="Diagnostic evaluation status and updates">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No child profile linked to your account. Contact your coordinator.</p></CardContent></Card>
      </PageContainer>
    );
  }

  const client = await prisma.client.findUnique({
    where: { id: guardian.clientId },
    include: {
      diagnosticCases: {
        take: 1, orderBy: { createdAt: "desc" },
        include: {
          referral: { select: { status: true, referralNumber: true } },
          interviews: {
            where: { isCancelled: false, isCompleted: false, scheduledStart: { gte: new Date() } },
            orderBy: { scheduledStart: "asc" }, take: 3,
          },
          report: { select: { status: true } },
        },
      },
    },
  });

  if (!client) {
    return (
      <PageContainer title="My Child&apos;s Progress" description="Diagnostic evaluation status and updates">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No records found.</p></CardContent></Card>
      </PageContainer>
    );
  }

  const latestCase = client.diagnosticCases[0];
  const reportReady = latestCase?.report?.status === "DELIVERED" || latestCase?.report?.status === "APPROVED";

  return (
    <PageContainer title={`${client.firstName}'s Progress`} description="Diagnostic evaluation status and updates">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {latestCase && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Status</p>
                <StatusBadge status={latestCase.referral.status} type="referral" />
                <p className="text-xs text-muted-foreground mt-1">Case {latestCase.caseNumber}</p>
              </div>
            </CardContent>
          </Card>
        )}
        <StatCard
          title="Upcoming Appointments"
          value={latestCase?.interviews?.length ?? 0}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          title="Report Status"
          value={reportReady ? "Ready" : "In Progress"}
          icon={<ClipboardCheck className="h-5 w-5" />}
        />
      </div>
      {latestCase?.interviews && latestCase.interviews.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Upcoming Appointments</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {latestCase.interviews.map((interview) => (
                <div key={interview.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{interview.interviewType.replace(/_/g, " ")}</span>
                  <span className="text-muted-foreground">{format(new Date(interview.scheduledStart), "MMM d, yyyy 'at' h:mm a")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
