import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { ReportForm } from "./report-form";

export default async function NewReportPage() {
  const cases = await prisma.diagnosticCase.findMany({
    where: { report: null },
    select: { id: true, caseNumber: true, client: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <PageContainer title="New Report" description="Create a new diagnostic report">
      <ReportForm cases={JSON.parse(JSON.stringify(cases))} />
    </PageContainer>
  );
}
