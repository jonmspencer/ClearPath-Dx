import { notFound } from "next/navigation";
import { auth } from "@clearpath/auth";
import { hasPermission } from "@clearpath/rbac";
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

  const session = await auth();
  const userRole = session?.user?.activeRole as any;
  const canEdit = hasPermission(userRole, "REPORT:UPDATE");
  const canApprove = hasPermission(userRole, "REPORT:APPROVE");
  const canDelete = hasPermission(userRole, "REPORT:DELETE");

  let isAuthor = false;
  if (session?.user?.id) {
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    isAuthor = providerProfile?.id === report.authorId;
  }

  return (
    <PageContainer title={`Report for ${report.diagnosticCase.caseNumber}`} description={`${report.diagnosticCase.client.firstName} ${report.diagnosticCase.client.lastName}`}>
      <ReportDetailClient
        report={JSON.parse(JSON.stringify(report))}
        isAuthor={isAuthor}
        canEdit={canEdit}
        canApprove={canApprove}
        canDelete={canDelete}
      />
    </PageContainer>
  );
}
