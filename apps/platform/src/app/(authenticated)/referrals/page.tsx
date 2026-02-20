import { PageContainer } from "@/components/page-container";
import { ReferralListClient } from "./referral-list-client";

export default function ReferralsPage() {
  return (
    <PageContainer
      title="Referrals"
      description="Manage incoming referrals and track their progress through the pipeline"
    >
      <ReferralListClient />
    </PageContainer>
  );
}
