import { notFound } from "next/navigation";
import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { BillingEditForm } from "./billing-edit-form";

export default async function EditBillingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await prisma.billingRecord.findUnique({ where: { id }, include: { diagnosticCase: { select: { caseNumber: true } } } });
  if (!record) notFound();
  return (
    <PageContainer title={`Edit Billing — ${record.diagnosticCase.caseNumber}`}>
      <BillingEditForm record={JSON.parse(JSON.stringify(record))} />
    </PageContainer>
  );
}
