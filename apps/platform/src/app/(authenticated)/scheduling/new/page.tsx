import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { InterviewForm } from "./interview-form";

export default async function NewInterviewPage({
  searchParams,
}: {
  searchParams: Promise<{ caseId?: string }>;
}) {
  const { caseId } = await searchParams;

  const [cases, providers] = await Promise.all([
    prisma.diagnosticCase.findMany({
      select: {
        id: true,
        caseNumber: true,
        client: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.providerProfile.findMany({
      where: { isAcceptingCases: true },
      select: {
        id: true,
        user: { select: { name: true } },
      },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return (
    <PageContainer title="Schedule Interview" description="Schedule a new interview or testing session">
      <InterviewForm
        cases={JSON.parse(JSON.stringify(cases))}
        providers={JSON.parse(JSON.stringify(providers))}
        defaultCaseId={caseId}
      />
    </PageContainer>
  );
}
