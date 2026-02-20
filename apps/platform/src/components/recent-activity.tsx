"use client";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@clearpath/ui/components/card";

interface ActivityItem {
  id: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  actorName?: string | null;
  createdAt: string;
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">No recent activity.</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">{item.actorName ?? "System"}</span>
                <span className="text-muted-foreground"> {item.action.toLowerCase().replace(/_/g, " ")} </span>
                <span className="font-medium">{item.resource}</span>
                {item.resourceId && <span className="text-muted-foreground"> ({item.resourceId})</span>}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                {format(new Date(item.createdAt), "MMM d, h:mm a")}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
