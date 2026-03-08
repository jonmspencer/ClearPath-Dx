import { test, expect } from "@playwright/test";

test.describe("Dashboard Smoke Tests", () => {
  test("should redirect /dashboard to role-specific dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/dashboard\/admin/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard\/admin/);
  });

  test("should load admin dashboard with stats", async ({ page }) => {
    await page.goto("/dashboard/admin");
    await expect(page.getByRole("heading", { name: /admin dashboard/i })).toBeVisible({ timeout: 10000 });
  });

  // Actual heading text from PageContainer title prop for each dashboard
  const roleDashboards = [
    { path: "/dashboard/super-admin", heading: /super admin dashboard/i },
    { path: "/dashboard/finance-admin", heading: /finance dashboard/i },
    { path: "/dashboard/intake-coordinator", heading: /intake dashboard/i },
    { path: "/dashboard/scheduler", heading: /scheduling dashboard/i },
    { path: "/dashboard/account-manager", heading: /account management/i },
    { path: "/dashboard/community-dev", heading: /community development/i },
    { path: "/dashboard/psychologist", heading: /provider dashboard/i },
    { path: "/dashboard/psychometrist", heading: /provider dashboard/i },
    { path: "/dashboard/aba-provider-admin", heading: /aba provider dashboard/i },
    { path: "/dashboard/aba-provider-staff", heading: /aba provider dashboard/i },
    { path: "/dashboard/pediatrician-admin", heading: /pediatrician dashboard/i },
    { path: "/dashboard/parent-guardian", heading: /progress/i },
  ];

  for (const { path, heading } of roleDashboards) {
    test(`should load ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible({ timeout: 10000 });
    });
  }

  test("should display sidebar navigation links", async ({ page }) => {
    await page.goto("/dashboard/admin");
    await expect(page.getByRole("heading", { name: /admin dashboard/i })).toBeVisible({ timeout: 10000 });

    const sidebarLinks = ["Referrals", "Clients", "Scheduling", "Reports", "Billing"];
    for (const linkText of sidebarLinks) {
      await expect(page.getByRole("link", { name: linkText }).first()).toBeVisible();
    }
  });
});
