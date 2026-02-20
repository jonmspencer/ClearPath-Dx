import { notFound } from "next/navigation";
import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { ProviderEditForm } from "./provider-edit-form";

export default async function EditProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = await prisma.providerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
  });
  if (!provider) notFound();
  return (
    <PageContainer title={`Edit Provider — ${provider.user.firstName} ${provider.user.lastName}`}>
      <ProviderEditForm provider={JSON.parse(JSON.stringify(provider))} />
    </PageContainer>
  );
}
