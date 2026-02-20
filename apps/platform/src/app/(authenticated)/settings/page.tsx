import { PageContainer } from "@/components/page-container";
import { SettingsClient } from "./settings-client";

export default function SettingsPage() {
  return (
    <PageContainer title="Settings" description="Manage organization settings and your profile">
      <SettingsClient />
    </PageContainer>
  );
}
