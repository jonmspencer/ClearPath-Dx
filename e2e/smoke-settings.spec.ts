import { test, expect } from "@playwright/test";
import { expectPageLoaded } from "./helpers";

test.describe("Settings Smoke Tests", () => {
  test("should load settings page with organization tab", async ({ page }) => {
    await page.goto("/settings");
    await expectPageLoaded(page, /settings/i);
    await expect(page.getByRole("tab", { name: /organization/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /profile/i })).toBeVisible();
  });

  test("should switch to profile tab", async ({ page }) => {
    await page.goto("/settings");
    await expectPageLoaded(page, /settings/i);
    await page.getByRole("tab", { name: /profile/i }).click();
    await expect(page.getByText(/your profile/i).first()).toBeVisible();
  });

  test("should load profile tab via query param", async ({ page }) => {
    await page.goto("/settings?tab=profile");
    await expectPageLoaded(page, /settings/i);
    await expect(page.getByText(/your profile/i).first()).toBeVisible();
  });

  test("should display organization form fields", async ({ page }) => {
    await page.goto("/settings");
    await expectPageLoaded(page, /settings/i);
    // Wait for data to load
    await expect(page.getByLabel(/organization name/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    await expect(page.getByLabel(/phone/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /save changes/i })).toBeVisible();
  });

  test("should display profile form fields", async ({ page }) => {
    await page.goto("/settings?tab=profile");
    await expectPageLoaded(page, /settings/i);
    await expect(page.getByLabel(/name/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /save profile/i })).toBeVisible();
  });
});

test.describe("Audit Log Smoke Tests", () => {
  test("should load audit log page", async ({ page }) => {
    await page.goto("/audit-log");
    await expectPageLoaded(page, /audit log/i);
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Theme Toggle Smoke Tests", () => {
  test("should toggle dark mode", async ({ page }) => {
    await page.goto("/dashboard/admin");
    await expect(page.getByRole("heading", { name: /admin dashboard/i })).toBeVisible({ timeout: 10000 });

    // Click theme toggle (moon/sun button)
    const themeButton = page.getByRole("button", { name: /toggle theme/i });
    await expect(themeButton).toBeVisible();
    await themeButton.click();

    // Verify dark class is applied to html element
    await expect(page.locator("html")).toHaveClass(/dark/, { timeout: 5000 });

    // Toggle back to light
    await themeButton.click();
    await expect(page.locator("html")).not.toHaveClass(/dark/, { timeout: 5000 });
  });
});

test.describe("Header Navigation Smoke Tests", () => {
  test("should navigate to profile from header user info", async ({ page }) => {
    await page.goto("/dashboard/admin");
    await expect(page.getByRole("heading", { name: /admin dashboard/i })).toBeVisible({ timeout: 10000 });

    // Click profile link in header
    const profileLink = page.getByRole("link", { name: /settings\?tab=profile/i }).or(
      page.locator("header a[href*='settings?tab=profile']")
    );
    await profileLink.click();
    await expect(page).toHaveURL(/\/settings\?tab=profile/);
    await expectPageLoaded(page, /settings/i);
  });

  test("should sign out and redirect to login", async ({ page }) => {
    await page.goto("/dashboard/admin");
    await expect(page.getByRole("heading", { name: /admin dashboard/i })).toBeVisible({ timeout: 10000 });

    // Click sign out button
    const signOutButton = page.getByRole("button", { name: /sign out/i }).or(
      page.getByRole("link", { name: /sign out/i })
    );
    await signOutButton.click();
    await page.waitForURL(/\/auth\/login/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
