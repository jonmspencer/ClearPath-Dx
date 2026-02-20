import { PageContainer } from "@/components/page-container";
import { ReportListClient } from "./report-list-client";

export default function ReportsPage() {
  return (
    <PageContainer title="Reports" description="Manage diagnostic reports and the review workflow">
      <ReportListClient />
    </PageContainer>
  );
}
