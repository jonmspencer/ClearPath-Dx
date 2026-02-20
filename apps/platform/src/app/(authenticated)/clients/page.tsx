import { PageContainer } from "@/components/page-container";
import { ClientListClient } from "./client-list-client";

export default function ClientsPage() {
  return (
    <PageContainer
      title="Clients"
      description="Manage clients and their guardians, view linked cases and care flags"
    >
      <ClientListClient />
    </PageContainer>
  );
}
