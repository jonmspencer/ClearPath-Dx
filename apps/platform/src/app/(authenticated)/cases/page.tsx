import { PageContainer } from "@/components/page-container";
import { CaseListClient } from "./case-list-client";

export default function CasesPage() {
  return (
    <PageContainer
      title="Diagnostic Cases"
      description="Manage diagnostic evaluation cases and track progress"
    >
      <CaseListClient />
    </PageContainer>
  );
}
