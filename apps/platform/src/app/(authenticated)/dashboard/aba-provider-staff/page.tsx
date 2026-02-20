import { auth } from "@clearpath/auth";
import { prisma } from "@clearpath/database";
import { redirect } from "next/navigation";
import { FileText, Clock, CheckCircle, ClipboardCheck } from "lucide-react";
import { PageContainer } from "@/components/page-container";
import { StatCard } from "@/components/stat-card";

export default async function AbaProviderStaffDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const orgId = session.user.activeOrganizationId;

  const [totalReferrals, activeReferrals, completedCases, reportsDelivered] = await Promise.all([
    prisma.referral.count({ where: { referringOrgId: orgId } }),
    prisma.referral.count({ where: { referringOrgId: orgId, status: { notIn: ["CLOSED", "DIAGNOSIS_COMPLETE", "REPORT_DELIVERED"] } } }),
    prisma.referral.count({ where: { referringOrgId: orgId, status: { in: ["DIAGNOSIS_COMPLETE", "REPORT_DELIVERED", "CLOSED"] } } }),
    prisma.referral.count({ where: { referringOrgId: orgId, status: "REPORT_DELIVERED" } }),
  ]);

  return (
    <PageContainer title="ABA Provider Dashboard" description="Referral tracking and case status">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Referrals" value={totalReferrals} icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Active Referrals" value={activeReferrals} icon={<Clock className="h-5 w-5" />} />
        <StatCard title="Completed" value={completedCases} icon={<CheckCircle className="h-5 w-5" />} />
        <StatCard title="Reports Delivered" value={reportsDelivered} icon={<ClipboardCheck className="h-5 w-5" />} />
      </div>
    </PageContainer>
  );
}
