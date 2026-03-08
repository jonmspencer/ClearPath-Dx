import { notFound } from "next/navigation";
import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { CaseEditForm } from "./case-edit-form";

export default async function EditCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const diagnosticCase = await prisma.diagnosticCase.findUnique({
    where: { id },
    include: {
      referral: { select: { id: true, referralNumber: true } },
      client: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!diagnosticCase) notFound();

  const [users, providers] = await Promise.all([
    prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.providerProfile.findMany({
      where: { isAcceptingCases: true },
      select: {
        id: true,
        user: { select: { name: true } },
        specialties: true,
      },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return (
    <PageContainer title={`Edit Case ${diagnosticCase.caseNumber}`}>
      <CaseEditForm
        diagnosticCase={JSON.parse(JSON.stringify(diagnosticCase))}
        users={JSON.parse(JSON.stringify(users))}
        providers={JSON.parse(JSON.stringify(providers))}
      />
    </PageContainer>
  );
}
