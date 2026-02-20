import { describe, it, expect } from "vitest";
import {
  NAVIGATION_ITEMS,
  getNavigationForRole,
  getDashboardPath,
} from "../navigation";
import { UserRole } from "@clearpath/types";

describe("NAVIGATION_ITEMS", () => {
  it("Dashboard should be accessible to all roles", () => {
    const dashboardItem = NAVIGATION_ITEMS.find((item) => item.label === "Dashboard");
    expect(dashboardItem).toBeDefined();
    const allRoles = Object.values(UserRole);
    for (const role of allRoles) {
      expect(dashboardItem!.roles).toContain(role);
    }
  });

  it("each nav item should have a non-empty label, href, and icon", () => {
    for (const item of NAVIGATION_ITEMS) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.href).toMatch(/^\//);
      expect(item.icon.length).toBeGreaterThan(0);
      expect(item.roles.length).toBeGreaterThan(0);
    }
  });
});

describe("getNavigationForRole", () => {
  it("SUPER_ADMIN should see all nav items", () => {
    const items = getNavigationForRole(UserRole.SUPER_ADMIN);
    expect(items.length).toBe(NAVIGATION_ITEMS.length);
  });

  it("PARENT_GUARDIAN should have minimal nav items", () => {
    const items = getNavigationForRole(UserRole.PARENT_GUARDIAN);
    const labels = items.map((i) => i.label);
    expect(labels).toContain("Dashboard");
    expect(labels).toContain("Clients");
    expect(labels).toContain("Cases");
    expect(labels).toContain("Reports");
    // Should NOT have admin-level items
    expect(labels).not.toContain("Billing");
    expect(labels).not.toContain("Providers");
    expect(labels).not.toContain("Users");
    expect(labels).not.toContain("Audit Log");
    expect(labels).not.toContain("Settings");
  });

  it("FINANCE_ADMIN should see Billing and Audit Log but not Referrals", () => {
    const items = getNavigationForRole(UserRole.FINANCE_ADMIN);
    const labels = items.map((i) => i.label);
    expect(labels).toContain("Billing");
    expect(labels).toContain("Audit Log");
    expect(labels).not.toContain("Referrals");
  });

  it("SCHEDULER should see Scheduling and Providers", () => {
    const items = getNavigationForRole(UserRole.SCHEDULER);
    const labels = items.map((i) => i.label);
    expect(labels).toContain("Scheduling");
    expect(labels).toContain("Providers");
  });

  it("PSYCHOLOGIST should see Scheduling, Reports, and Clients", () => {
    const items = getNavigationForRole(UserRole.PSYCHOLOGIST);
    const labels = items.map((i) => i.label);
    expect(labels).toContain("Scheduling");
    expect(labels).toContain("Reports");
    expect(labels).toContain("Clients");
  });

  it("ABA_PROVIDER_ADMIN should see Referrals and Organizations", () => {
    const items = getNavigationForRole(UserRole.ABA_PROVIDER_ADMIN);
    const labels = items.map((i) => i.label);
    expect(labels).toContain("Referrals");
    expect(labels).toContain("Organizations");
    expect(labels).toContain("Users");
  });

  it("every role should get at least Dashboard", () => {
    for (const role of Object.values(UserRole)) {
      const items = getNavigationForRole(role);
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items.map((i) => i.label)).toContain("Dashboard");
    }
  });
});

describe("getDashboardPath", () => {
  it("returns a unique path for each role", () => {
    const paths = new Set<string>();
    for (const role of Object.values(UserRole)) {
      const path = getDashboardPath(role);
      expect(path).toMatch(/^\/dashboard\//);
      paths.add(path);
    }
    // All 13 roles should map to distinct paths
    expect(paths.size).toBe(Object.values(UserRole).length);
  });

  it("SUPER_ADMIN gets /dashboard/super-admin", () => {
    expect(getDashboardPath(UserRole.SUPER_ADMIN)).toBe("/dashboard/super-admin");
  });

  it("PARENT_GUARDIAN gets /dashboard/parent-guardian", () => {
    expect(getDashboardPath(UserRole.PARENT_GUARDIAN)).toBe("/dashboard/parent-guardian");
  });

  it("FINANCE_ADMIN gets /dashboard/finance-admin", () => {
    expect(getDashboardPath(UserRole.FINANCE_ADMIN)).toBe("/dashboard/finance-admin");
  });

  it("falls back to /dashboard for unknown role", () => {
    expect(getDashboardPath("UNKNOWN" as UserRole)).toBe("/dashboard");
  });
});
