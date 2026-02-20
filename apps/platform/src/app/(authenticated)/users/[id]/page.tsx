import { notFound } from "next/navigation";
import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { UserDetailClient } from "./user-detail-client";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      image: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      organizationMemberships: {
        include: { organization: { select: { id: true, name: true } } },
      },
      providerProfile: true,
      _count: {
        select: {
          assignedCases: true,
          scheduledCases: true,
          auditLogs: true,
        },
      },
    },
  });
  if (!user) notFound();

  const organizations = await prisma.organization.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <PageContainer title={user.name || user.email}>
      <UserDetailClient user={JSON.parse(JSON.stringify(user))} organizations={JSON.parse(JSON.stringify(organizations))} />
    </PageContainer>
  );
}
