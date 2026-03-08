import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@clearpath/database";
import { Calendar, CalendarCheck, Clock, Activity } from "lucide-react";
import { PageContainer } from "@/components/page-container";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";

export default async function SchedulerDashboardPage() {
  const now = new Date();
  const todayStart = new Date(now.toDateString());
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const [
    readyToSchedule, upcomingInterviews, todayInterviews, availableProviders,
    nextInterviews,
  ] = await Promise.all([
    prisma.referral.count({ where: { status: "READY_TO_SCHEDULE" } }),
    prisma.interviewEvent.count({ where: { scheduledStart: { gte: now }, isCancelled: false, isCompleted: false } }),
    prisma.interviewEvent.count({
      where: { scheduledStart: { gte: todayStart, lt: todayEnd }, isCancelled: false },
    }),
    prisma.providerProfile.count({ where: { isAcceptingCases: true } }),
    prisma.interviewEvent.findMany({
      take: 10, orderBy: { scheduledStart: "asc" },
      where: { scheduledStart: { gte: now }, isCancelled: false },
      include: {
        diagnosticCase: { select: { caseNumber: true, client: { select: { firstName: true, lastName: true } } } },
        provider: { select: { user: { select: { name: true } } } },
      },
    }),
  ]);

  return (
    <PageContainer title="Scheduling Dashboard" description="Appointments, availability, and scheduling queue">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ready to Schedule" value={readyToSchedule} icon={<CalendarCheck className="h-5 w-5" />} />
        <StatCard title="Upcoming Interviews" value={upcomingInterviews} icon={<Calendar className="h-5 w-5" />} />
        <StatCard title="Today" value={todayInterviews} description="interviews scheduled" icon={<Clock className="h-5 w-5" />} />
        <StatCard title="Available Providers" value={availableProviders} icon={<Activity className="h-5 w-5" />} />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Upcoming Interviews</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nextInterviews.map((i: any) => (
              <div key={i.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <Link href={`/scheduling/${i.id}`} className="font-medium text-primary hover:underline">
                    {i.diagnosticCase.caseNumber}
                  </Link>
                  <span>{i.diagnosticCase.client.firstName} {i.diagnosticCase.client.lastName}</span>
                  <span className="text-muted-foreground">with {i.provider.user.name}</span>
                </div>
                <span className="text-muted-foreground whitespace-nowrap">
                  {format(new Date(i.scheduledStart), "MMM d, h:mm a")}
                </span>
              </div>
            ))}
            {nextInterviews.length === 0 && <p className="text-sm text-muted-foreground">No upcoming interviews.</p>}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
