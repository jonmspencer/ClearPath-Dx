import { notFound } from "next/navigation";
import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { BillingDetailClient } from "./billing-detail-client";

export default async function BillingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await prisma.billingRecord.findUnique({
    where: { id },
    include: {
      diagnosticCase: { select: { id: true, caseNumber: true, client: { select: { firstName: true, lastName: true } } } },
      organization: { select: { id: true, name: true } },
    },
  });
  if (!record) notFound();
  return (
    <PageContainer title={`Billing — ${record.diagnosticCase.caseNumber}`}>
      <BillingDetailClient record={JSON.parse(JSON.stringify(record))} />
    </PageContainer>
  );
}
