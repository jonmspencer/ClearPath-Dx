import { PageContainer } from "@/components/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";

export default function SuperAdminDashboardPage() {
  return (
    <PageContainer title="Super Admin Dashboard" description="Marketplace overview, supply metrics, and system health">
      <Card>
        <CardHeader>
          <CardTitle>Super Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This section is under construction.</p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
