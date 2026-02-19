import { PageContainer } from "@/components/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";

export default function ParentGuardianDashboardPage() {
  return (
    <PageContainer title="My Child's Progress" description="Diagnostic evaluation status and updates">
      <Card>
        <CardHeader>
          <CardTitle>My Child&apos;s Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This section is under construction.</p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
