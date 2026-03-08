import { test, expect } from "@playwright/test";
import { expectPageLoaded } from "./helpers";

test.describe("Scheduling Smoke Tests", () => {
  test("should load scheduling list page", async ({ page }) => {
    await page.goto("/scheduling");
    await expectPageLoaded(page, /scheduling/i);
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to new interview form via link", async ({ page }) => {
    await page.goto("/scheduling");
    await expectPageLoaded(page, /scheduling/i);
    await page.getByRole("link", { name: /new interview/i }).click();
    await expect(page).toHaveURL(/\/scheduling\/new/);
    await expectPageLoaded(page, /schedule interview/i);
  });

  test("should load new interview form and cancel navigates back", async ({ page }) => {
    await page.goto("/scheduling/new");
    await expectPageLoaded(page, /schedule interview/i);
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page).not.toHaveURL(/\/scheduling\/new/);
  });

  test("should navigate to interview detail if data exists", async ({ page }) => {
    await page.goto("/scheduling");
    await expectPageLoaded(page, /scheduling/i);
    // Wait for table to be visible and data to load
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // If "No results." is shown, skip the test
    const noResultsCell = page.locator("table td", { hasText: "No results." });
    if (await noResultsCell.isVisible()) {
      test.skip(true, "No interview data seeded in database");
      return;
    }

    // Scheduling table uses actions dropdown (not direct row links)
    const actionsButton = page.locator("table tbody tr").first().getByRole("button").last();
    await actionsButton.click();
    await page.getByRole("menuitem", { name: /view/i }).click();
    await expect(page).toHaveURL(/\/scheduling\/[a-z0-9-]+$/);
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to edit from interview detail if data exists", async ({ page }) => {
    await page.goto("/scheduling");
    await expectPageLoaded(page, /scheduling/i);
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    const noResultsCell = page.locator("table td", { hasText: "No results." });
    if (await noResultsCell.isVisible()) {
      test.skip(true, "No interview data seeded in database");
      return;
    }

    const actionsButton = page.locator("table tbody tr").first().getByRole("button").last();
    await actionsButton.click();
    await page.getByRole("menuitem", { name: /view/i }).click();
    await expect(page).toHaveURL(/\/scheduling\/[a-z0-9-]+$/);

    await page.getByRole("link", { name: /edit/i }).click();
    await expect(page).toHaveURL(/\/scheduling\/[a-z0-9-]+\/edit/);
    await expect(page.getByRole("heading", { name: /edit/i }).first()).toBeVisible({ timeout: 10000 });
  });
});
