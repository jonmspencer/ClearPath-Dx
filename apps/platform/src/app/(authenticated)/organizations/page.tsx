import { PageContainer } from "@/components/page-container";
import { OrgListClient } from "./org-list-client";

export default function OrganizationsPage() {
  return (
    <PageContainer title="Organizations" description="Manage organizations, providers, and partners">
      <OrgListClient />
    </PageContainer>
  );
}
