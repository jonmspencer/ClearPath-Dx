import { prisma } from "@clearpath/database";
import { FileText, Users, Briefcase, ClipboardCheck, Activity, Building2 } from "lucide-react";
import { PageContainer } from "@/components/page-container";
import { StatCard } from "@/components/stat-card";
import { RecentActivity } from "@/components/recent-activity";

export default async function AdminDashboardPage() {
  const [
    totalReferrals, pendingReferrals, totalClients, activeCases,
    reportsInReview, totalProviders, totalOrgs, recentActivity,
  ] = await Promise.all([
    prisma.referral.count(),
    prisma.referral.count({ where: { status: { in: ["RECEIVED", "INTAKE_IN_PROGRESS"] } } }),
    prisma.client.count(),
    prisma.diagnosticCase.count(),
    prisma.diagnosticReport.count({ where: { status: "IN_REVIEW" } }),
    prisma.providerProfile.count(),
    prisma.organization.count({ where: { isActive: true } }),
    prisma.auditLog.findMany({
      take: 10, orderBy: { createdAt: "desc" },
      include: { actor: { select: { name: true } } },
    }),
  ]);

  return (
    <PageContainer title="Admin Dashboard" description="Operations overview and team management">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Referrals" value={totalReferrals} description={`${pendingReferrals} pending intake`} icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Total Clients" value={totalClients} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Active Cases" value={activeCases} description={`${reportsInReview} reports in review`} icon={<Briefcase className="h-5 w-5" />} />
        <StatCard title="Providers" value={totalProviders} icon={<Activity className="h-5 w-5" />} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Reports in Review" value={reportsInReview} icon={<ClipboardCheck className="h-5 w-5" />} />
        <StatCard title="Organizations" value={totalOrgs} icon={<Building2 className="h-5 w-5" />} />
        <StatCard title="Pending Referrals" value={pendingReferrals} icon={<FileText className="h-5 w-5" />} />
      </div>
      <RecentActivity items={recentActivity.map((a) => ({
        id: a.id, action: a.action, resource: a.resource,
        resourceId: a.resourceId, actorName: a.actor?.name ?? null, createdAt: a.createdAt.toISOString(),
      }))} />
    </PageContainer>
  );
}
