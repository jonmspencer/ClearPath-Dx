import { PageContainer } from "@/components/page-container";
import { BillingListClient } from "./billing-list-client";

export default function BillingPage() {
  return (
    <PageContainer title="Billing" description="Manage billing records, claims, and payments">
      <BillingListClient />
    </PageContainer>
  );
}
