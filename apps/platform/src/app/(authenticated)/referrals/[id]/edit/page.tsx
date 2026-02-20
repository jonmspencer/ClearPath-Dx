import { notFound } from "next/navigation";
import { prisma } from "@clearpath/database";
import { PageContainer } from "@/components/page-container";
import { ReferralEditForm } from "./referral-edit-form";

export default async function EditReferralPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const referral = await prisma.referral.findUnique({
    where: { id },
    include: {
      referringOrg: { select: { id: true, name: true } },
    },
  });

  if (!referral) notFound();

  const organizations = await prisma.organization.findMany({
    where: { isActive: true },
    select: { id: true, name: true, type: true },
    orderBy: { name: "asc" },
  });

  return (
    <PageContainer title={`Edit Referral ${referral.referralNumber}`}>
      <ReferralEditForm
        referral={JSON.parse(JSON.stringify(referral))}
        organizations={JSON.parse(JSON.stringify(organizations))}
      />
    </PageContainer>
  );
}
