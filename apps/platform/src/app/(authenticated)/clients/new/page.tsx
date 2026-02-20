import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { ClientForm } from "./client-form";

export default async function NewClientPage() {
  const [organizations, referrals] = await Promise.all([
    prisma.organization.findMany({
      where: { isActive: true },
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    }),
    prisma.referral.findMany({
      where: {
        client: null, // Only referrals not yet linked to a client
      },
      select: {
        id: true,
        referralNumber: true,
        childFirstName: true,
        childLastName: true,
        referringOrgId: true,
      },
      orderBy: { receivedAt: "desc" },
    }),
  ]);

  return (
    <PageContainer title="New Client" description="Create a new client record from a referral">
      <ClientForm
        organizations={JSON.parse(JSON.stringify(organizations))}
        referrals={JSON.parse(JSON.stringify(referrals))}
      />
    </PageContainer>
  );
}
