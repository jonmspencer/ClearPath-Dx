import Link from "next/link";
import { prisma } from "@clearpath/database";
import { FileText, UserPlus, Phone, CalendarCheck } from "lucide-react";
import { PageContainer } from "@/components/page-container";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";
import { StatusBadge } from "@/components/status-badge";

export default async function IntakeCoordinatorDashboardPage() {
  const [
    receivedReferrals, intakeInProgress, parentContacted, readyToSchedule,
    recentReferrals,
  ] = await Promise.all([
    prisma.referral.count({ where: { status: "RECEIVED" } }),
    prisma.referral.count({ where: { status: "INTAKE_IN_PROGRESS" } }),
    prisma.referral.count({ where: { status: "PARENT_CONTACTED" } }),
    prisma.referral.count({ where: { status: "READY_TO_SCHEDULE" } }),
    prisma.referral.findMany({
      take: 10, orderBy: { createdAt: "desc" },
      select: { id: true, referralNumber: true, childFirstName: true, childLastName: true, status: true, createdAt: true },
    }),
  ]);

  return (
    <PageContainer title="Intake Dashboard" description="Referral queue and intake pipeline">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="New Referrals" value={receivedReferrals} description="Awaiting intake" icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Intake In Progress" value={intakeInProgress} icon={<UserPlus className="h-5 w-5" />} />
        <StatCard title="Parent Contacted" value={parentContacted} icon={<Phone className="h-5 w-5" />} />
        <StatCard title="Ready to Schedule" value={readyToSchedule} icon={<CalendarCheck className="h-5 w-5" />} />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Referrals</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReferrals.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <Link href={`/referrals/${r.id}`} className="font-medium text-primary hover:underline">{r.referralNumber}</Link>
                  <span>{r.childFirstName} {r.childLastName}</span>
                </div>
                <StatusBadge status={r.status} type="referral" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
