import { notFound } from "next/navigation";
import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { ReferralDetailClient } from "./referral-detail-client";

export default async function ReferralDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const referral = await prisma.referral.findUnique({
    where: { id },
    include: {
      referringOrg: { select: { id: true, name: true, type: true } },
      referralSource: { select: { id: true, label: true, channel: true } },
      client: { select: { id: true, firstName: true, lastName: true } },
      diagnosticCase: { select: { id: true, caseNumber: true } },
      statusHistory: { orderBy: { changedAt: "asc" } },
    },
  });

  if (!referral) notFound();

  return (
    <PageContainer title={`Referral ${referral.referralNumber}`} description={`${referral.childFirstName} ${referral.childLastName}`}>
      <ReferralDetailClient referral={JSON.parse(JSON.stringify(referral))} />
    </PageContainer>
  );
}
