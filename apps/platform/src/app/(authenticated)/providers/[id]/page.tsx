import { notFound } from "next/navigation";
import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { ProviderDetailClient } from "./provider-detail-client";

export default async function ProviderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = await prisma.providerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      organization: { select: { id: true, name: true } },
      availability: { orderBy: { dayOfWeek: "asc" } },
      casesAsPsych: {
        select: { id: true, caseNumber: true, status: true, client: { select: { firstName: true, lastName: true } } },
        take: 10,
        orderBy: { createdAt: "desc" },
      },
      casesAsPsychom: {
        select: { id: true, caseNumber: true, status: true, client: { select: { firstName: true, lastName: true } } },
        take: 10,
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          casesAsPsych: true,
          casesAsPsychom: true,
          interviews: true,
        },
      },
    },
  });
  if (!provider) notFound();
  return (
    <PageContainer title={`Provider — ${provider.user.firstName} ${provider.user.lastName}`}>
      <ProviderDetailClient provider={JSON.parse(JSON.stringify(provider))} />
    </PageContainer>
  );
}
