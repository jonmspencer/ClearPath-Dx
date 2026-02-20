import { PageContainer } from "@/components/page-container";
import { UserListClient } from "./user-list-client";

export default function UsersPage() {
  return (
    <PageContainer title="Users" description="Manage user accounts, roles, and organization memberships">
      <UserListClient />
    </PageContainer>
  );
}
