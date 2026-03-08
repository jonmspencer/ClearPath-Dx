import { PageContainer } from "@/components/page-container";
import { PayoutListClient } from "./payout-list-client";

export default function PayoutsPage() {
  return (
    <PageContainer title="Payouts" description="View your payout history and pending payments">
      <PayoutListClient />
    </PageContainer>
  );
}
