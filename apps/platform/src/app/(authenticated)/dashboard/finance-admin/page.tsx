import { PageContainer } from "@/components/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";

export default function FinanceAdminDashboardPage() {
  return (
    <PageContainer title="Finance Dashboard" description="Billing, payouts, and revenue tracking">
      <Card>
        <CardHeader>
          <CardTitle>Finance Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This section is under construction.</p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
