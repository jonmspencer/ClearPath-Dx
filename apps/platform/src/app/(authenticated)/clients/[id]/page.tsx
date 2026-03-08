import { notFound } from "next/navigation";
import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { ClientDetailClient } from "./client-detail-client";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      referringOrg: { select: { id: true, name: true, type: true } },
      referral: { select: { id: true, referralNumber: true, status: true } },
      guardians: true,
      diagnosticCases: {
        select: {
          id: true,
          caseNumber: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      careFlags: {
        select: {
          id: true,
          title: true,
          severity: true,
          description: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) notFound();

  return (
    <PageContainer
      title={`${client.firstName} ${client.lastName}`}
      description={client.preferredName ? `Preferred name: ${client.preferredName}` : undefined}
    >
      <ClientDetailClient client={JSON.parse(JSON.stringify(client))} />
    </PageContainer>
  );
}
