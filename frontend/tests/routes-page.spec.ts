import { expect, test, type Page } from "@playwright/test";

const routes = [
  {
    id: 1,
    name: "Waldweg",
    createdAt: null,
    geometry: {
      type: "LineString",
      coordinates: [
        [8, 50],
        [8.001, 50.001],
      ],
    },
  },
  {
    id: 2,
    name: "Feldrunde",
    createdAt: null,
    geometry: {
      type: "LineString",
      coordinates: [
        [8, 50],
        [8.002, 50.002],
      ],
    },
  },
];

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({
      json:
        path === "/api/auth/session"
          ? { authenticated: true }
          : path === "/api/routes"
            ? routes
            : path.endsWith("/share")
              ? { shareToken: "test" }
              : path === "/api/meta"
                ? {}
                : [],
    });
  });
  await page.route("https://*.tile.openstreetmap.org/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"/>',
    }),
  );
});

async function addRoute(page: Page, name: string) {
  await page
    .getByRole("button", { name: "Routen hinzufügen", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Routen hinzufügen",
    exact: true,
  });
  await dialog.getByLabel("Gespeicherte Routen suchen").fill(name);
  await dialog
    .getByRole("button", { name: `${name} hinzufügen`, exact: true })
    .click();
  await expect(
    dialog.getByRole("button", {
      name: `${name} ist auf der Karte`,
      exact: true,
    }),
  ).toBeDisabled();
  await expect(
    dialog.getByRole("button", { name: "Fertig", exact: true }),
  ).toHaveCount(0);
  await page.screenshot({ path: "test-results/add-routes-mobile.png" });
  await dialog.getByRole("button", { name: "Schließen", exact: true }).click();
}

test("only added routes appear; hide and undo preserve saved routes", async ({
  page,
}) => {
  await page.goto("/routes?visibility=all");
  await expect(
    page.getByRole("heading", { name: "Noch keine Routen auf der Karte" }),
  ).toBeVisible();
  await expect(page.getByRole("combobox")).toHaveCount(0);
  await addRoute(page, "Waldweg");
  const routeLink = page.getByRole("link", {
    name: "Waldweg auf der Karte ansehen",
    exact: true,
  });
  await expect(routeLink).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Feldrunde auf der Karte ansehen",
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Aktionen für Waldweg", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Von der Karte ausblenden", exact: true })
    .click();
  await expect(routeLink).toHaveCount(0);
  await page.getByRole("button", { name: "Rückgängig", exact: true }).click();
  await expect(routeLink).toBeVisible();
  await page.getByLabel("Eingeblendete Routen suchen").fill("Feldrunde");
  await expect(
    page.getByText("Keine eingeblendeten Routen für diese Suche gefunden."),
  ).toBeVisible();
  await addRoute(page, "Feldrunde");
  await expect(page.getByLabel("Eingeblendete Routen suchen")).toHaveValue("");
  await expect(
    page.getByRole("link", {
      name: "Feldrunde auf der Karte ansehen",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/routes-mobile.png" });
  await routeLink.click();
  await expect(page).toHaveURL(/\/\?route=1$/);
});

test("bulk actions are secondary and deletion requires confirmation", async ({
  page,
}) => {
  let deletions = 0;
  await page.route("**/api/routes/1", (route) => {
    deletions++;
    return route.fulfill({ status: 204 });
  });
  await page.goto("/routes");
  await expect(
    page.getByRole("button", { name: "Alle einblenden", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Weitere Aktionen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Alle einblenden", exact: true })
    .click();
  await expect(
    page
      .getByRole("region", { name: "Eingeblendete Routen" })
      .getByRole("link"),
  ).toHaveCount(2);
  await page
    .getByRole("button", { name: "Weitere Aktionen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Alle ausblenden", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Noch keine Routen auf der Karte" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Rückgängig", exact: true }).click();
  await page
    .getByRole("button", { name: "Aktionen für Waldweg", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Bearbeiten", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Link teilen", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Dauerhaft löschen", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Route dauerhaft löschen?" }),
  ).toBeVisible();
  expect(deletions).toBe(0);
  await page.getByRole("button", { name: "Zurück", exact: true }).click();
  await page.screenshot({ path: "test-results/route-actions-mobile.png" });
});

test("empty library offers a way back to the map", async ({ page }) => {
  await page.route("**/api/routes", (route) => route.fulfill({ json: [] }));
  await page.goto("/routes");
  await page
    .getByRole("button", { name: "Routen hinzufügen", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Zur Karte", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Zur Karte", exact: true }).click();
  await expect(page).toHaveURL("/");
});
