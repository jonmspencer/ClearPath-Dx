import { notFound } from "next/navigation";
import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { OrgDetailClient } from "./org-detail-client";

export default async function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      accountManager: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { isPrimary: "desc" },
      },
      referralSources: { select: { id: true, label: true, channel: true, identifier: true, isActive: true } },
      _count: { select: { referrals: true, clients: true, billingRecords: true } },
    },
  });
  if (!organization) notFound();
  return (
    <PageContainer title={organization.name}>
      <OrgDetailClient organization={JSON.parse(JSON.stringify(organization))} />
    </PageContainer>
  );
}
