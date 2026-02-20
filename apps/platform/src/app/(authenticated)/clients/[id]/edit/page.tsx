import { notFound } from "next/navigation";
import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { ClientEditForm } from "./client-edit-form";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      referringOrg: { select: { id: true, name: true } },
    },
  });

  if (!client) notFound();

  return (
    <PageContainer title={`Edit ${client.firstName} ${client.lastName}`}>
      <ClientEditForm client={JSON.parse(JSON.stringify(client))} />
    </PageContainer>
  );
}
