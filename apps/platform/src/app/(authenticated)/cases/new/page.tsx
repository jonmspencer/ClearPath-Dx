import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { CaseForm } from "./case-form";

export default async function NewCasePage() {
  const [referrals, clients, users, providers] = await Promise.all([
    prisma.referral.findMany({
      where: { diagnosticCase: null },
      select: {
        id: true,
        referralNumber: true,
        childFirstName: true,
        childLastName: true,
      },
      orderBy: { receivedAt: "desc" },
      take: 100,
    }),
    prisma.client.findMany({
      select: { id: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
    }),
    prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.providerProfile.findMany({
      where: { isActive: true },
      select: {
        id: true,
        user: { select: { name: true } },
        specialties: true,
      },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return (
    <PageContainer title="New Diagnostic Case" description="Create a new diagnostic evaluation case">
      <CaseForm
        referrals={JSON.parse(JSON.stringify(referrals))}
        clients={JSON.parse(JSON.stringify(clients))}
        users={JSON.parse(JSON.stringify(users))}
        providers={JSON.parse(JSON.stringify(providers))}
      />
    </PageContainer>
  );
}
