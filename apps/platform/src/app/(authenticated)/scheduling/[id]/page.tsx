import { notFound } from "next/navigation";
import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { InterviewDetailClient } from "./interview-detail-client";

const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  PARENT_INTERVIEW: "Parent Interview",
  CHILD_OBSERVATION: "Child Observation",
  SCHOOL_OBSERVATION: "School Observation",
  TESTING_SESSION: "Testing Session",
  FEEDBACK_SESSION: "Feedback Session",
};

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const interview = await prisma.interviewEvent.findUnique({
    where: { id },
    include: {
      diagnosticCase: {
        select: {
          id: true,
          caseNumber: true,
          client: { select: { id: true, firstName: true, lastName: true } },
          referral: { select: { id: true, referralNumber: true } },
        },
      },
      provider: {
        select: {
          id: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!interview) notFound();

  const typeLabel = INTERVIEW_TYPE_LABELS[interview.interviewType] ?? interview.interviewType;

  return (
    <PageContainer
      title={typeLabel}
      description={`Case ${interview.diagnosticCase?.caseNumber ?? "Unknown"}`}
    >
      <InterviewDetailClient interview={JSON.parse(JSON.stringify(interview))} />
    </PageContainer>
  );
}
