import { prisma } from "@clearpath/database";
import { Building2, GraduationCap, Heart, Stethoscope, FileText } from "lucide-react";
import { PageContainer } from "@/components/page-container";
import { StatCard } from "@/components/stat-card";

export default async function CommunityDevDashboardPage() {
  const [totalOrgs, schoolOrgs, abaOrgs, pediatricianOrgs, totalReferrals] = await Promise.all([
    prisma.organization.count({ where: { isActive: true } }),
    prisma.organization.count({ where: { type: "SCHOOL", isActive: true } }),
    prisma.organization.count({ where: { type: "ABA_PROVIDER", isActive: true } }),
    prisma.organization.count({ where: { type: "PEDIATRICIAN", isActive: true } }),
    prisma.referral.count(),
  ]);

  return (
    <PageContainer title="Community Development" description="School partnerships and outreach">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Partners" value={totalOrgs} icon={<Building2 className="h-5 w-5" />} />
        <StatCard title="Schools" value={schoolOrgs} icon={<GraduationCap className="h-5 w-5" />} />
        <StatCard title="ABA Providers" value={abaOrgs} icon={<Heart className="h-5 w-5" />} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Pediatricians" value={pediatricianOrgs} icon={<Stethoscope className="h-5 w-5" />} />
        <StatCard title="Total Referrals" value={totalReferrals} description="Across all partners" icon={<FileText className="h-5 w-5" />} />
      </div>
    </PageContainer>
  );
}
