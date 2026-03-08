import { notFound } from "next/navigation";
import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { InterviewEditForm } from "./interview-edit-form";

const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  PARENT_INTERVIEW: "Parent Interview",
  CHILD_OBSERVATION: "Child Observation",
  SCHOOL_OBSERVATION: "School Observation",
  TESTING_SESSION: "Testing Session",
  FEEDBACK_SESSION: "Feedback Session",
};

export default async function EditInterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const interview = await prisma.interviewEvent.findUnique({
    where: { id },
    include: {
      diagnosticCase: { select: { id: true, caseNumber: true } },
      provider: { select: { id: true, user: { select: { name: true } } } },
    },
  });

  if (!interview) notFound();

  const providers = await prisma.providerProfile.findMany({
    where: { isAcceptingCases: true },
    select: {
      id: true,
      user: { select: { name: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  const typeLabel = INTERVIEW_TYPE_LABELS[interview.interviewType] ?? interview.interviewType;

  return (
    <PageContainer title={`Edit ${typeLabel}`}>
      <InterviewEditForm
        interview={JSON.parse(JSON.stringify(interview))}
        providers={JSON.parse(JSON.stringify(providers))}
      />
    </PageContainer>
  );
}
