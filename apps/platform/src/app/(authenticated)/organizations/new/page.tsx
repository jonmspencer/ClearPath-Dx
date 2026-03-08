import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { OrgForm } from "./org-form";

export default async function NewOrganizationPage() {
  const accountManagers = await prisma.user.findMany({
    where: {
      organizationMemberships: {
        some: { role: "ACCOUNT_MANAGER", isActive: true },
      },
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  return (
    <PageContainer title="New Organization">
      <OrgForm accountManagers={JSON.parse(JSON.stringify(accountManagers))} />
    </PageContainer>
  );
}
