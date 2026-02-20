import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { BillingForm } from "./billing-form";

export default async function NewBillingPage() {
  const [cases, organizations] = await Promise.all([
    prisma.diagnosticCase.findMany({
      select: { id: true, caseNumber: true, client: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.organization.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return (
    <PageContainer title="New Billing Record">
      <BillingForm cases={JSON.parse(JSON.stringify(cases))} organizations={JSON.parse(JSON.stringify(organizations))} />
    </PageContainer>
  );
}
