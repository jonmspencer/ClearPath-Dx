import { prisma } from "@clearpath/database";
import { DollarSign, CreditCard, CheckCircle, Clock } from "lucide-react";
import { PageContainer } from "@/components/page-container";
import { StatCard } from "@/components/stat-card";
import { RecentActivity } from "@/components/recent-activity";

export default async function FinanceAdminDashboardPage() {
  const [
    pendingBilling, submittedBilling, paidBilling, totalBilling,
    pendingPayouts, approvedPayouts, recentActivity,
  ] = await Promise.all([
    prisma.billingRecord.count({ where: { status: "PENDING" } }),
    prisma.billingRecord.count({ where: { status: "SUBMITTED" } }),
    prisma.billingRecord.count({ where: { status: "PAID" } }),
    prisma.billingRecord.count(),
    prisma.providerPayoutLedger.count({ where: { status: "PENDING" } }),
    prisma.providerPayoutLedger.count({ where: { status: "APPROVED" } }),
    prisma.auditLog.findMany({
      where: { resource: { in: ["BillingRecord", "ProviderPayoutLedger"] } },
      take: 10, orderBy: { createdAt: "desc" },
      include: { actor: { select: { name: true } } },
    }),
  ]);

  return (
    <PageContainer title="Finance Dashboard" description="Billing, payouts, and revenue tracking">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pending Billing" value={pendingBilling} icon={<Clock className="h-5 w-5" />} />
        <StatCard title="Submitted Claims" value={submittedBilling} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Paid Claims" value={paidBilling} description={`of ${totalBilling} total`} icon={<CheckCircle className="h-5 w-5" />} />
        <StatCard title="Pending Payouts" value={pendingPayouts} description={`${approvedPayouts} approved`} icon={<CreditCard className="h-5 w-5" />} />
      </div>
      <RecentActivity items={recentActivity.map((a: any) => ({
        id: a.id, action: a.action, resource: a.resource,
        resourceId: a.resourceId, actorName: a.actor?.name ?? null, createdAt: a.createdAt.toISOString(),
      }))} />
    </PageContainer>
  );
}
