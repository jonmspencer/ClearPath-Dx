import { PageContainer } from "@/components/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";

export default function SchedulerDashboardPage() {
  return (
    <PageContainer title="Scheduling Dashboard" description="Appointments, availability, and scheduling queue">
      <Card>
        <CardHeader>
          <CardTitle>Scheduling Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This section is under construction.</p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
