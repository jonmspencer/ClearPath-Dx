import { PageContainer } from "@/components/page-container";
import { AuditLogClient } from "./audit-log-client";

export default function AuditLogPage() {
  return (
    <PageContainer title="Audit Log" description="Track all system activity and changes">
      <AuditLogClient />
    </PageContainer>
  );
}
