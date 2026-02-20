import { notFound } from "next/navigation";
import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { ReportEditForm } from "./report-edit-form";

export default async function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await prisma.diagnosticReport.findUnique({
    where: { id },
    include: { diagnosticCase: { select: { caseNumber: true } } },
  });
  if (!report) notFound();
  return (
    <PageContainer title={`Edit Report — ${report.diagnosticCase.caseNumber}`}>
      <ReportEditForm report={JSON.parse(JSON.stringify(report))} />
    </PageContainer>
  );
}
