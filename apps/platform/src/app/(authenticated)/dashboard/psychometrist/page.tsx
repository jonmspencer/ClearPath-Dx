import { PageContainer } from "@/components/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";

export default function PsychometristDashboardPage() {
  return (
    <PageContainer title="Provider Dashboard" description="Your cases, testing sessions, and availability">
      <Card>
        <CardHeader>
          <CardTitle>Provider Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This section is under construction.</p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
