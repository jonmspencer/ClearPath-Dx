import { auth } from "@clearpath/auth";
import { redirect } from "next/navigation";
import { getDashboardPath } from "@clearpath/rbac";
import type { UserRole } from "@clearpath/types";

export default async function DashboardRouter() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const dashboardPath = getDashboardPath(session.user.activeRole as UserRole);
  redirect(dashboardPath);
}
