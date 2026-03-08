import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should show admin dashboard with real stats", async ({ page }) => {
    await page.goto("/dashboard/admin");
    await expect(page.getByText(/total referrals/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/total clients/i)).toBeVisible();
    await expect(page.getByText(/active cases/i)).toBeVisible();
  });

  test("should navigate to all main sections", async ({ page }) => {
    await page.goto("/dashboard/admin");
    await expect(page.getByRole("heading", { name: /admin dashboard/i })).toBeVisible({ timeout: 10000 });

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
