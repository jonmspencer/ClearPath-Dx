import { PageContainer } from "@/components/page-container";
import { SchedulingClient } from "./scheduling-client";

export default function SchedulingPage() {
  return (
    <PageContainer
      title="Scheduling"
      description="Manage interviews, testing sessions, and provider availability"
    >
      <SchedulingClient />
    </PageContainer>
  );
}
