import { auth } from "@clearpath/auth";
import { PageContainer } from "@/components/page-container";
import { CoordinatorQueueClient } from "./coordinator-queue-client";

export default async function CoordinatorQueuePage() {
  const session = await auth();

  return (
    <PageContainer
      title="Coordinator Queue"
      description="Parents awaiting contact — call, log notes, and advance referrals through the pipeline"
    >
      <CoordinatorQueueClient />
    </PageContainer>
  );
}
