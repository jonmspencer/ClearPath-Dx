import { test, expect } from "@playwright/test";
import { expectPageLoaded, getFirstRowLink } from "./helpers";

test.describe("Clients Smoke Tests", () => {
  test("should load clients list page", async ({ page }) => {
    await page.goto("/clients");
    await expectPageLoaded(page, /clients/i);
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to new client form via link", async ({ page }) => {
    await page.goto("/clients");
    await expectPageLoaded(page, /clients/i);
    await page.getByRole("link", { name: /new client/i }).click();
    await expect(page).toHaveURL(/\/clients\/new/);
    await expectPageLoaded(page, /new client/i);
  });

  test("should load new client form and cancel navigates back", async ({ page }) => {
    await page.goto("/clients/new");
    await expectPageLoaded(page, /new client/i);
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page).not.toHaveURL(/\/clients\/new/);
  });

  test("should navigate to client detail from list", async ({ page }) => {
    await page.goto("/clients");
    await expectPageLoaded(page, /clients/i);
    await getFirstRowLink(page);
    await expect(page).toHaveURL(/\/clients\/[a-z0-9-]+$/);
    // Detail page heading is the client's name — just check any h1 is visible
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to edit from client detail", async ({ page }) => {
    await page.goto("/clients");
    await expectPageLoaded(page, /clients/i);
    await getFirstRowLink(page);
    await expect(page).toHaveURL(/\/clients\/[a-z0-9-]+$/);

    await page.getByRole("link", { name: /edit/i }).click();
    await expect(page).toHaveURL(/\/clients\/[a-z0-9-]+\/edit/);
    await expect(page.getByRole("heading", { name: /edit/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test("should load edit form and cancel navigates back", async ({ page }) => {
    await page.goto("/clients");
    await expectPageLoaded(page, /clients/i);
    await getFirstRowLink(page);
    await page.getByRole("link", { name: /edit/i }).click();
    await expect(page).toHaveURL(/\/clients\/[a-z0-9-]+\/edit/);

    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page).not.toHaveURL(/\/edit/);
  });
});
