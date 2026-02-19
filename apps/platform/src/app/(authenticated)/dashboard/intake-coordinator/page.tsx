import { PageContainer } from "@/components/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";

export default function IntakeCoordinatorDashboardPage() {
  return (
    <PageContainer title="Intake Dashboard" description="Referral queue and intake pipeline">
      <Card>
        <CardHeader>
          <CardTitle>Intake Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This section is under construction.</p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
