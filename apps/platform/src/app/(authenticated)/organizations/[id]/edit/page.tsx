import { notFound } from "next/navigation";
import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { OrgEditForm } from "./org-edit-form";

export default async function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [organization, accountManagers] = await Promise.all([
    prisma.organization.findUnique({
      where: { id },
      include: { accountManager: { select: { id: true, name: true, email: true } } },
    }),
    prisma.user.findMany({
      where: {
        userOrganizations: {
          some: { role: "ACCOUNT_MANAGER", isActive: true },
        },
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!organization) notFound();
  return (
    <PageContainer title={`Edit — ${organization.name}`}>
      <OrgEditForm
        organization={JSON.parse(JSON.stringify(organization))}
        accountManagers={JSON.parse(JSON.stringify(accountManagers))}
      />
    </PageContainer>
  );
}
