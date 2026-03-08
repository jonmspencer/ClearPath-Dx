const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  referrals: "Referrals",
  clients: "Clients",
  cases: "Cases",
  scheduling: "Scheduling",
  reports: "Reports",
  billing: "Billing",
  providers: "Providers",
  organizations: "Organizations",
  users: "Users",
  "audit-log": "Audit Log",
  settings: "Settings",
  new: "New",
  edit: "Edit",
};

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];

  const crumbs: BreadcrumbItem[] = [];
  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = SEGMENT_LABELS[segment] ?? formatSegment(segment);
    crumbs.push({ label, href: currentPath });
  }

  return crumbs;
}

function formatSegment(segment: string): string {
  // If it looks like a UUID, truncate it
  if (/^[0-9a-f]{8}-[0-9a-f]{4}/.test(segment)) {
    return segment.slice(0, 8) + "...";
  }
  // If it looks like a CUID or other ID
  if (segment.length > 20) {
    return segment.slice(0, 8) + "...";
  }
  // Otherwise, capitalize words
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
