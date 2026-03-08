import { expect, type Page } from "@playwright/test";

/**
 * Assert that a page loaded successfully: heading visible.
 */
export async function expectPageLoaded(page: Page, heading: string | RegExp) {
  await expect(
    page.getByRole("heading", { name: heading }).first()
  ).toBeVisible({ timeout: 10000 });
}

/**
 * Click the first data-row link in a table and return the href.
 */
export async function getFirstRowLink(page: Page): Promise<string> {
  const link = page.locator("table tbody tr a").first();
  await expect(link).toBeVisible({ timeout: 10000 });
  const href = await link.getAttribute("href");
  await link.click();
  return href ?? "";
}
