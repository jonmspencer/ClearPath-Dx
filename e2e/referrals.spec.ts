import { test, expect } from "@playwright/test";

test.describe("Referrals", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin first
    await page.goto("/auth/login");
    await page.getByLabel(/email/i).fill("admin@clearpathdx.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
  });

  test("should display referrals list page", async ({ page }) => {
    await page.goto("/referrals");
    await expect(page.getByRole("heading", { name: /referrals/i })).toBeVisible();
    // Should show data table
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to new referral form", async ({ page }) => {
    await page.goto("/referrals");
    await page.getByRole("link", { name: /new referral/i }).click();
    await expect(page).toHaveURL(/.*referrals\/new/);
  });

  test("should navigate to referral detail", async ({ page }) => {
    await page.goto("/referrals");
    // Wait for table data to load
    await page.waitForSelector("table tbody tr", { timeout: 10000 });
    // Click on first referral link
    const firstLink = page.locator("table tbody tr").first().getByRole("link").first();
    await firstLink.click();
    await expect(page).toHaveURL(/.*referrals\/[a-z0-9]/);
  });
});
