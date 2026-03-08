import { test, expect } from "@playwright/test";
import { expectPageLoaded, getFirstRowLink } from "./helpers";

test.describe("Providers Smoke Tests", () => {
  test("should load providers list page", async ({ page }) => {
    await page.goto("/providers");
    await expectPageLoaded(page, /providers/i);
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to new provider form via link", async ({ page }) => {
    await page.goto("/providers");
    await expectPageLoaded(page, /providers/i);
    await page.getByRole("link", { name: /new provider/i }).click();
    await expect(page).toHaveURL(/\/providers\/new/);
    await expectPageLoaded(page, /new provider/i);
  });

  test("should load new provider form and cancel navigates back", async ({ page }) => {
    await page.goto("/providers/new");
    await expectPageLoaded(page, /new provider/i);
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page).not.toHaveURL(/\/providers\/new/);
  });

  test("should navigate to provider detail from list", async ({ page }) => {
    await page.goto("/providers");
    await expectPageLoaded(page, /providers/i);
    await getFirstRowLink(page);
    await expect(page).toHaveURL(/\/providers\/[a-z0-9-]+$/);
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to edit from provider detail", async ({ page }) => {
    await page.goto("/providers");
    await expectPageLoaded(page, /providers/i);
    await getFirstRowLink(page);
    await page.getByRole("link", { name: /edit/i }).click();
    await expect(page).toHaveURL(/\/providers\/[a-z0-9-]+\/edit/);
    await expect(page.getByRole("heading", { name: /edit provider/i }).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Organizations Smoke Tests", () => {
  test("should load organizations list page", async ({ page }) => {
    await page.goto("/organizations");
    await expectPageLoaded(page, /organizations/i);
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to new organization form via link", async ({ page }) => {
    await page.goto("/organizations");
    await expectPageLoaded(page, /organizations/i);
    await page.getByRole("link", { name: /new organization/i }).click();
    await expect(page).toHaveURL(/\/organizations\/new/);
    await expectPageLoaded(page, /new organization/i);
  });

  test("should load new organization form and cancel navigates back", async ({ page }) => {
    await page.goto("/organizations/new");
    await expectPageLoaded(page, /new organization/i);
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page).not.toHaveURL(/\/organizations\/new/);
  });

  test("should navigate to organization detail from list", async ({ page }) => {
    await page.goto("/organizations");
    await expectPageLoaded(page, /organizations/i);
    await getFirstRowLink(page);
    await expect(page).toHaveURL(/\/organizations\/[a-z0-9-]+$/);
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to edit from organization detail", async ({ page }) => {
    await page.goto("/organizations");
    await expectPageLoaded(page, /organizations/i);
    await getFirstRowLink(page);
    await page.getByRole("link", { name: /edit/i }).click();
    await expect(page).toHaveURL(/\/organizations\/[a-z0-9-]+\/edit/);
    await expect(page.getByRole("heading", { name: /edit/i }).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Users Smoke Tests", () => {
  test("should load users list page", async ({ page }) => {
    await page.goto("/users");
    await expectPageLoaded(page, /users/i);
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to new user form via link", async ({ page }) => {
    await page.goto("/users");
    await expectPageLoaded(page, /users/i);
    await page.getByRole("link", { name: /new user/i }).click();
    await expect(page).toHaveURL(/\/users\/new/);
    await expectPageLoaded(page, /new user/i);
  });

  test("should load new user form and cancel navigates back", async ({ page }) => {
    await page.goto("/users/new");
    await expectPageLoaded(page, /new user/i);
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page).not.toHaveURL(/\/users\/new/);
  });

  test("should navigate to user detail from list", async ({ page }) => {
    await page.goto("/users");
    await expectPageLoaded(page, /users/i);
    await getFirstRowLink(page);
    await expect(page).toHaveURL(/\/users\/[a-z0-9-]+$/);
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to edit from user detail", async ({ page }) => {
    await page.goto("/users");
    await expectPageLoaded(page, /users/i);
    await getFirstRowLink(page);
    await page.getByRole("link", { name: /edit/i }).click();
    await expect(page).toHaveURL(/\/users\/[a-z0-9-]+\/edit/);
    await expect(page.getByRole("heading", { name: /edit user/i }).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Reports Smoke Tests", () => {
  test("should load reports list page", async ({ page }) => {
    await page.goto("/reports");
    await expectPageLoaded(page, /reports/i);
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to new report form via link", async ({ page }) => {
    await page.goto("/reports");
    await expectPageLoaded(page, /reports/i);
    await page.getByRole("link", { name: /new report/i }).click();
    await expect(page).toHaveURL(/\/reports\/new/);
    await expectPageLoaded(page, /new report/i);
  });

  test("should load new report form and cancel navigates back", async ({ page }) => {
    await page.goto("/reports/new");
    await expectPageLoaded(page, /new report/i);
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page).not.toHaveURL(/\/reports\/new/);
  });

  test("should navigate to report detail from list", async ({ page }) => {
    await page.goto("/reports");
    await expectPageLoaded(page, /reports/i);
    await getFirstRowLink(page);
    await expect(page).toHaveURL(/\/reports\/[a-z0-9-]+$/);
    await expect(page.getByRole("heading", { name: /report for/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to edit from report detail", async ({ page }) => {
    await page.goto("/reports");
    await expectPageLoaded(page, /reports/i);
    await getFirstRowLink(page);
    await page.getByRole("link", { name: /edit/i }).click();
    await expect(page).toHaveURL(/\/reports\/[a-z0-9-]+\/edit/);
    await expect(page.getByRole("heading", { name: /edit report/i }).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Billing Smoke Tests", () => {
  test("should load billing list page", async ({ page }) => {
    await page.goto("/billing");
    await expectPageLoaded(page, /billing/i);
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to new billing record form via link", async ({ page }) => {
    await page.goto("/billing");
    await expectPageLoaded(page, /billing/i);
    await page.getByRole("link", { name: /new record/i }).click();
    await expect(page).toHaveURL(/\/billing\/new/);
    await expectPageLoaded(page, /new billing record/i);
  });

  test("should load new billing form and cancel navigates back", async ({ page }) => {
    await page.goto("/billing/new");
    await expectPageLoaded(page, /new billing record/i);
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page).not.toHaveURL(/\/billing\/new/);
  });

  test("should navigate to billing detail from list", async ({ page }) => {
    await page.goto("/billing");
    await expectPageLoaded(page, /billing/i);
    await getFirstRowLink(page);
    await expect(page).toHaveURL(/\/billing\/[a-z0-9-]+$/);
    await expect(page.getByRole("heading", { name: /billing/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to edit from billing detail", async ({ page }) => {
    await page.goto("/billing");
    await expectPageLoaded(page, /billing/i);
    await getFirstRowLink(page);
    await page.getByRole("link", { name: /edit/i }).click();
    await expect(page).toHaveURL(/\/billing\/[a-z0-9-]+\/edit/);
    await expect(page.getByRole("heading", { name: /edit billing/i }).first()).toBeVisible({ timeout: 10000 });
  });
});
