import { test, expect } from "@playwright/test";
import { expectPageLoaded, getFirstRowLink } from "./helpers";

test.describe("Cases Smoke Tests", () => {
  test("should load cases list page", async ({ page }) => {
    await page.goto("/cases");
    await expectPageLoaded(page, /diagnostic cases/i);
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to new case form via link", async ({ page }) => {
    await page.goto("/cases");
    await expectPageLoaded(page, /diagnostic cases/i);
    await page.getByRole("link", { name: /new case/i }).click();
    await expect(page).toHaveURL(/\/cases\/new/);
    await expectPageLoaded(page, /new diagnostic case/i);
  });

  test("should load new case form and cancel navigates back", async ({ page }) => {
    await page.goto("/cases/new");
    await expectPageLoaded(page, /new diagnostic case/i);
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page).not.toHaveURL(/\/cases\/new/);
  });

  test("should navigate to case detail from list", async ({ page }) => {
    await page.goto("/cases");
    await expectPageLoaded(page, /diagnostic cases/i);
    await getFirstRowLink(page);
    await expect(page).toHaveURL(/\/cases\/[a-z0-9-]+$/);
    await expect(page.getByRole("heading", { name: /case case-/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to edit from case detail", async ({ page }) => {
    await page.goto("/cases");
    await expectPageLoaded(page, /diagnostic cases/i);
    await getFirstRowLink(page);
    await expect(page).toHaveURL(/\/cases\/[a-z0-9-]+$/);

    await page.getByRole("link", { name: /edit/i }).click();
    await expect(page).toHaveURL(/\/cases\/[a-z0-9-]+\/edit/);
    await expect(page.getByRole("heading", { name: /edit case/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test("should load edit form and cancel navigates back", async ({ page }) => {
    await page.goto("/cases");
    await expectPageLoaded(page, /diagnostic cases/i);
    await getFirstRowLink(page);
    await page.getByRole("link", { name: /edit/i }).click();
    await expect(page).toHaveURL(/\/cases\/[a-z0-9-]+\/edit/);

    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page).not.toHaveURL(/\/edit/);
  });
});
