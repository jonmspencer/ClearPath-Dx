import { PageContainer } from "@/components/page-container";
import { ProviderListClient } from "./provider-list-client";

export default function ProvidersPage() {
  return (
    <PageContainer title="Providers" description="Manage provider profiles and availability">
      <ProviderListClient />
    </PageContainer>
  );
}
