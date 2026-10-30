import { expect, type Page } from "@playwright/test";

export async function openNavigation(page: Page) {
  await page
    .getByRole("button", { name: "Navigation und Kartenoptionen öffnen" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Navigation und Karte" }),
  ).toBeVisible();
}

export async function closeNavigation(page: Page) {
  await page
    .getByRole("dialog", { name: "Navigation und Karte" })
    .getByRole("button", { name: "Schließen", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Navigation und Karte" }),
  ).toBeHidden();
}
