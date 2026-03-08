import { test, expect } from "@playwright/test";

// Auth tests must run without pre-existing session
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Authentication", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByText(/clearpath/i).first()).toBeVisible();
  });

  test("should redirect unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*login/);
  });

  test("should login with valid credentials", async ({ page }) => {
    await page.goto("/auth/login");
    await page.locator("#email").fill("admin@clearpathdx.com");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("should reject invalid credentials", async ({ page }) => {
    await page.goto("/auth/login");
    await page.locator("#email").fill("admin@clearpathdx.com");
    await page.locator("#password").fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/invalid|error|incorrect/i)).toBeVisible({ timeout: 10000 });
  });
});
