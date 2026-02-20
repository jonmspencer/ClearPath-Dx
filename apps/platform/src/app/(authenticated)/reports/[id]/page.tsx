import { notFound } from "next/navigation";
import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { ReportDetailClient } from "./report-detail-client";

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await prisma.diagnosticReport.findUnique({
    where: { id },
    include: {
      diagnosticCase: { select: { id: true, caseNumber: true, client: { select: { id: true, firstName: true, lastName: true } } } },
      author: { select: { id: true, user: { select: { name: true, email: true } } } },
      reviewQueue: { orderBy: { assignedAt: "desc" }, include: { reviewer: { select: { user: { select: { name: true } } } } } },
    },
  });
  if (!report) notFound();

  return (
    <PageContainer title={`Report for ${report.diagnosticCase.caseNumber}`} description={`${report.diagnosticCase.client.firstName} ${report.diagnosticCase.client.lastName}`}>
      <ReportDetailClient report={JSON.parse(JSON.stringify(report))} />
    </PageContainer>
  );
}
