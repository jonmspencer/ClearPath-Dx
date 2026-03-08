import { auth } from "@clearpath/auth";
import { redirect } from "next/navigation";
import { getDashboardPath } from "@clearpath/rbac";
import type { UserRole } from "@clearpath/types";

export default async function DashboardRouter() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const dashboardPath = getDashboardPath((session.user as any).activeRole as UserRole);
  redirect(dashboardPath);
}
