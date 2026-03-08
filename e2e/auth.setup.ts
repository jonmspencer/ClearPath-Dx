import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, ".auth", "admin.json");

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/auth/login");
  await page.locator("#email").fill("admin@clearpathdx.com");
  await page.locator("#password").fill("password123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/.*dashboard/, { timeout: 15000 });
  await expect(page).toHaveURL(/.*dashboard/);
  await page.context().storageState({ path: authFile });
});
