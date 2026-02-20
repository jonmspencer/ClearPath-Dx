import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { UserForm } from "./user-form";

export default async function NewUserPage() {
  const organizations = await prisma.organization.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return (
    <PageContainer title="New User">
      <UserForm organizations={JSON.parse(JSON.stringify(organizations))} />
    </PageContainer>
  );
}
