import { notFound } from "next/navigation";
import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { CaseDetailClient } from "./case-detail-client";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const diagnosticCase = await prisma.diagnosticCase.findUnique({
    where: { id },
    include: {
      referral: {
        select: {
          id: true,
          referralNumber: true,
          status: true,
          childFirstName: true,
          childLastName: true,
        },
      },
      client: {
        select: { id: true, firstName: true, lastName: true, dateOfBirth: true },
      },
      coordinator: { select: { id: true, name: true, email: true } },
      scheduler: { select: { id: true, name: true, email: true } },
      psychologist: {
        select: {
          id: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      psychometrist: {
        select: {
          id: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      interviews: {
        orderBy: { scheduledStart: "asc" },
        select: {
          id: true,
          interviewType: true,
          scheduledStart: true,
          scheduledEnd: true,
          isCompleted: true,
          isCancelled: true,
        },
      },
      report: { select: { id: true, status: true } },
      billingRecords: { select: { id: true, status: true, amountBilled: true } },
      careFlags: {
        where: { resolvedAt: null },
        select: { id: true, severity: true, description: true },
      },
    },
  });

  if (!diagnosticCase) notFound();

  const clientName = diagnosticCase.client
    ? `${diagnosticCase.client.firstName} ${diagnosticCase.client.lastName}`
    : "Unknown Client";

  return (
    <PageContainer
      title={`Case ${diagnosticCase.caseNumber}`}
      description={clientName}
    >
      <CaseDetailClient diagnosticCase={JSON.parse(JSON.stringify(diagnosticCase))} />
    </PageContainer>
  );
}
