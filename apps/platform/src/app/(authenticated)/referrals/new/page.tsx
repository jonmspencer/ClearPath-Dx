import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { ReferralForm } from "./referral-form";

export default async function NewReferralPage() {
  const organizations = await prisma.organization.findMany({
    where: { isActive: true },
    select: { id: true, name: true, type: true },
    orderBy: { name: "asc" },
  });

  return (
    <PageContainer title="New Referral" description="Create a new referral for diagnostic evaluation">
      <ReferralForm organizations={JSON.parse(JSON.stringify(organizations))} />
    </PageContainer>
  );
}
