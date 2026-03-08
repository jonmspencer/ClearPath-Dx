import { auth } from "@clearpath/auth";
import { hasPermission } from "@clearpath/rbac";
import { PageContainer } from "@/components/page-container";
import { ReportListClient } from "./report-list-client";

export default async function ReportsPage() {
  const session = await auth();
  const canCreate = session?.user
    ? hasPermission((session.user as any).activeRole as any, "REPORT:CREATE")
    : false;

  return (
    <PageContainer title="Reports" description="Manage diagnostic reports and the review workflow">
      <ReportListClient canCreate={canCreate} />
    </PageContainer>
  );
}
