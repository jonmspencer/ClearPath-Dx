import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { ProviderForm } from "./provider-form";

export default async function NewProviderPage() {
  const [users, organizations] = await Promise.all([
    prisma.user.findMany({
      where: {
        providerProfile: null,
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.organization.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return (
    <PageContainer title="New Provider">
      <ProviderForm users={JSON.parse(JSON.stringify(users))} organizations={JSON.parse(JSON.stringify(organizations))} />
    </PageContainer>
  );
}
