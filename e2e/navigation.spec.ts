import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByLabel(/email/i).fill("admin@clearpathdx.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
  });

  test("should show admin dashboard with real stats", async ({ page }) => {
    await expect(page.getByText(/total referrals/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/total clients/i)).toBeVisible();
    await expect(page.getByText(/active cases/i)).toBeVisible();
  });

  test("should navigate to all main sections", async ({ page }) => {
    const sections = [
      { name: /referrals/i, url: "/referrals" },
      { name: /clients/i, url: "/clients" },
      { name: /scheduling/i, url: "/scheduling" },
      { name: /reports/i, url: "/reports" },
      { name: /billing/i, url: "/billing" },
    ];

    for (const section of sections) {
      await page.getByRole("link", { name: section.name }).first().click();
      await expect(page).toHaveURL(new RegExp(section.url));
      await page.goto("/dashboard/admin");
    }
  });
});
