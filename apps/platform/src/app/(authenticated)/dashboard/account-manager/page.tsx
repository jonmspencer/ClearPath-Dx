import { prisma } from "@clearpath/database";
import { Building2, FileText, Users, Briefcase } from "lucide-react";
import { PageContainer } from "@/components/page-container";
import { StatCard } from "@/components/stat-card";

export default async function AccountManagerDashboardPage() {
  const [totalOrgs, activeReferrals, totalClients, activeCases] = await Promise.all([
    prisma.organization.count({ where: { isActive: true } }),
    prisma.referral.count({ where: { status: { notIn: ["CLOSED", "DIAGNOSIS_COMPLETE", "REPORT_DELIVERED"] } } }),
    prisma.client.count(),
    prisma.diagnosticCase.count(),
  ]);

  return (
    <PageContainer title="Account Management" description="Organization relationships and engagement">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Organizations" value={totalOrgs} icon={<Building2 className="h-5 w-5" />} />
        <StatCard title="Active Referrals" value={activeReferrals} icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Total Clients" value={totalClients} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Active Cases" value={activeCases} icon={<Briefcase className="h-5 w-5" />} />
      </div>
    </PageContainer>
  );
}
