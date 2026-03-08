import { test, expect } from "@playwright/test";
import { expectPageLoaded, getFirstRowLink } from "./helpers";

test.describe("Referrals Smoke Tests", () => {
  test("should load referrals list page", async ({ page }) => {
    await page.goto("/referrals");
    await expectPageLoaded(page, /referrals/i);
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to new referral form via link", async ({ page }) => {
    await page.goto("/referrals");
    await expectPageLoaded(page, /referrals/i);
    await page.getByRole("link", { name: /new referral/i }).click();
    await expect(page).toHaveURL(/\/referrals\/new/);
    await expectPageLoaded(page, /new referral/i);
  });

  test("should load new referral form and cancel navigates back", async ({ page }) => {
    await page.goto("/referrals/new");
    await expectPageLoaded(page, /new referral/i);
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page).not.toHaveURL(/\/referrals\/new/);
  });

  test("should navigate to referral detail from list", async ({ page }) => {
    await page.goto("/referrals");
    await expectPageLoaded(page, /referrals/i);
    const href = await getFirstRowLink(page);
    await expect(page).toHaveURL(/\/referrals\/[a-z0-9-]+$/);
    await expect(page.getByRole("heading", { name: /referral ref-/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to edit from referral detail", async ({ page }) => {
    await page.goto("/referrals");
    await expectPageLoaded(page, /referrals/i);
    await getFirstRowLink(page);
    await expect(page).toHaveURL(/\/referrals\/[a-z0-9-]+$/);

    await page.getByRole("link", { name: /edit/i }).click();
    await expect(page).toHaveURL(/\/referrals\/[a-z0-9-]+\/edit/);
    await expect(page.getByRole("heading", { name: /edit referral/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test("should load edit form and cancel navigates back", async ({ page }) => {
    await page.goto("/referrals");
    await expectPageLoaded(page, /referrals/i);
    await getFirstRowLink(page);
    await page.getByRole("link", { name: /edit/i }).click();
    await expect(page).toHaveURL(/\/referrals\/[a-z0-9-]+\/edit/);

    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page).not.toHaveURL(/\/edit/);
  });
});
