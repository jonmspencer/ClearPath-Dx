import { notFound } from "next/navigation";
import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { UserEditForm } from "./user-edit-form";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, phone: true, isActive: true },
  });
  if (!user) notFound();
  return (
    <PageContainer title={`Edit User — ${user.name || user.email}`}>
      <UserEditForm user={JSON.parse(JSON.stringify(user))} />
    </PageContainer>
  );
}
