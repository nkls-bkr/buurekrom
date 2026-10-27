import { expect, test, type Page } from "@playwright/test";
import type { Map } from "leaflet";

declare global {
  interface Window {
    __testMap: Map;
    __permission: "granted" | "denied";
    __permissionCalls: number;
    __resolvePermission: () => void;
    __updatePosition: (latitude: number, longitude: number) => void;
    __failPosition: () => void;
  }
}

const route = {
  id: 1,
  name: "Testroute",
  createdAt: null,
  geometry: {
    type: "LineString",
    coordinates: [
      [8, 50],
      [8.001, 50.001],
      [8.002, 50],
    ],
  },
};
const errors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const pageErrors: string[] = [];
  errors.set(page, pageErrors);
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    let leaflet: typeof import("leaflet");
    Object.defineProperty(window, "L", {
      configurable: true,
      get: () => leaflet,
      set: (value: typeof import("leaflet")) => {
        leaflet = value;
        value.Map.addInitHook(function (this: Map) {
          window.__testMap = this;
        });
      },
    });
    window.__permission = "granted";
    window.__permissionCalls = 0;
    Object.defineProperty(DeviceOrientationEvent, "requestPermission", {
      configurable: true,
      value: () => {
        window.__permissionCalls += 1;
        return Promise.resolve(window.__permission);
      },
    });
    Object.defineProperty(screen.orientation, "angle", {
      configurable: true,
      value: 0,
    });
    navigator.geolocation.watchPosition = (success, error) => {
      window.__updatePosition = (latitude, longitude) =>
        success({
          coords: { latitude, longitude, accuracy: 5 },
        } as GeolocationPosition);
      window.__failPosition = () =>
        error?.({
          code: 2,
          POSITION_UNAVAILABLE: 2,
        } as GeolocationPositionError);
      queueMicrotask(() => window.__updatePosition(50, 8));
      return 1;
    };
    navigator.geolocation.clearWatch = () => {};
  });
  await page.route("**/api/**", async (request) => {
    const path = new URL(request.request().url()).pathname;
    const data =
      path === "/api/auth/session"
        ? { authenticated: true }
        : path.startsWith("/api/shared/routes/")
          ? route
          : path === "/api/routes"
            ? [route]
            : path === "/api/fields"
              ? [
                  {
                    id: 1,
                    name: "Testfeld",
                    geometry: {
                      type: "Polygon",
                      coordinates: [
                        [
                          [8, 50],
                          [8.001, 50],
                          [8.001, 50.001],
                          [8, 50],
                        ],
                      ],
                    },
                  },
                ]
              : path === "/api/locations"
                ? [
                    {
                      id: 1,
                      name: "Testort",
                      geometry: { type: "Point", coordinates: [8, 50] },
                    },
                  ]
                : [];
    await request.fulfill({ json: data });
  });
  await page.route("https://*.tile.openstreetmap.org/**", (request) =>
    request.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#f7f3ea"/></svg>',
    }),
  );
});

test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([]);
});

async function heading(page: Page, degrees: number, safari = false) {
  await page.evaluate(
    ({ degrees, safari }) => {
      const event = new DeviceOrientationEvent(
        safari ? "deviceorientation" : "deviceorientationabsolute",
        {
          absolute: !safari,
          alpha: (360 - degrees) % 360,
          beta: 0,
          gamma: 0,
        },
      );
      if (safari) {
        Object.defineProperty(event, "webkitCompassHeading", {
          value: degrees,
        });
        Object.defineProperty(event, "webkitCompassAccuracy", { value: 10 });
      }
      window.dispatchEvent(event);
    },
    { degrees, safari },
  );
}

async function expectBearing(page: Page, degrees: number) {
  await expect
    .poll(() => page.evaluate(() => window.__testMap.getBearing()))
    .toBeCloseTo(degrees, 0);
}

async function activate(page: Page) {
  await page
    .getByRole("button", { name: "Karte nach Kompass ausrichten", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Kompass wird ermittelt – abbrechen" }),
  ).toBeVisible();
  await heading(page, 90);
  await expectBearing(page, 270);
}

async function activateNavigation(page: Page) {
  await page
    .getByRole("button", { name: "Navigationsmodus einschalten", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Navigationsmodus wartet auf Kompass – ausschalten",
    }),
  ).toBeVisible();
  await heading(page, 90);
  await expectBearing(page, 270);
  await expect(
    page.getByRole("button", {
      name: "Navigationsmodus ausschalten",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
}

async function expectCentered(page: Page, lat: number, lng: number) {
  await expect
    .poll(() =>
      page.evaluate(
        ({ lat, lng }) => {
          const map = window.__testMap;
          return map
            .latLngToContainerPoint([lat, lng])
            .distanceTo(map.getSize().divideBy(2));
        },
        { lat, lng },
      ),
    )
    .toBeLessThan(2);
}

for (const path of ["/", "/share/test-token"]) {
  test(`navigation follows GPS and screen direction and releases the map on exit: ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    await activateNavigation(page);
    await expectCentered(page, 50, 8);
    expect(
      await page.evaluate(() => window.__testMap.getZoom()),
    ).toBeGreaterThanOrEqual(16);
    expect(await page.evaluate(() => window.__testMap.dragging.enabled())).toBe(
      false,
    );
    await page.evaluate(() => window.__testMap.setZoom(18));
    await page.evaluate(() => window.__updatePosition(50.003, 8.004));
    await expectCentered(page, 50.003, 8.004);
    expect(await page.evaluate(() => window.__testMap.getZoom())).toBe(18);
    await page.evaluate(() =>
      Object.defineProperty(screen.orientation, "angle", { value: 90 }),
    );
    await heading(page, 90);
    await expectBearing(page, 180);
    await expectCentered(page, 50.003, 8.004);
    await page
      .getByRole("button", {
        name: "Navigationsmodus ausschalten",
        exact: true,
      })
      .click();
    await expectBearing(page, 0);
    expect(await page.evaluate(() => window.__testMap.dragging.enabled())).toBe(
      true,
    );
    const center = await page.evaluate(() => window.__testMap.getCenter());
    await page.evaluate(() => window.__updatePosition(51, 9));
    await heading(page, 180);
    await expectBearing(page, 0);
    expect(await page.evaluate(() => window.__testMap.getCenter())).toEqual(
      center,
    );
  });
}

test("navigation pauses for drawing and GPS errors and resumes with fresh positions", async ({
  page,
}) => {
  await page.goto("/");
  await activateNavigation(page);
  await page.getByRole("button", { name: "Neues Element erstellen" }).click();
  await page
    .getByRole("button", { name: "Feld zeichnen", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Navigationsmodus beim Zeichnen pausiert",
    }),
  ).toBeDisabled();
  const center = await page.evaluate(() => window.__testMap.getCenter());
  await page.evaluate(() => window.__updatePosition(50.001, 8.002));
  expect(await page.evaluate(() => window.__testMap.getCenter())).toEqual(
    center,
  );
  await expectBearing(page, 0);
  await page.getByRole("button", { name: "Abbrechen", exact: true }).click();
  await heading(page, 135);
  await expectBearing(page, 225);
  await expectCentered(page, 50.001, 8.002);
  await page.evaluate(() => window.__failPosition());
  await expect(
    page.getByRole("button", {
      name: "Navigationsmodus wartet auf Standort – ausschalten",
    }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.__testMap.dragging.enabled())).toBe(
    true,
  );
  await page.evaluate(() => window.__updatePosition(50.002, 8.003));
  await expectCentered(page, 50.002, 8.003);
});

test("navigation reuses the compass and cannot remain enabled after sensor failure", async ({
  page,
}) => {
  await page.goto("/");
  await activate(page);
  await page
    .getByRole("button", { name: "Navigationsmodus einschalten", exact: true })
    .click();
  await expectCentered(page, 50, 8);
  expect(await page.evaluate(() => window.__permissionCalls)).toBe(1);
  await page
    .getByRole("button", {
      name: "Kompass ausschalten und Karte nach Norden ausrichten",
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Navigationsmodus einschalten",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.evaluate(() => {
    window.__permission = "denied";
  });
  await page
    .getByRole("button", { name: "Navigationsmodus einschalten", exact: true })
    .click();
  await expect(
    page.getByText("Kompasszugriff nicht erlaubt.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Navigationsmodus einschalten",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate(() => window.__testMap.dragging.enabled())).toBe(
    true,
  );
});

test("compass rotates routes and fields, keeps markers aligned, and resets north", async ({
  page,
}) => {
  await page.goto("/?route=1");
  await activate(page);
  expect(await page.evaluate(() => window.__permissionCalls)).toBe(1);
  await expect(
    page.locator(".leaflet-rotate-pane .leaflet-routes-pane path"),
  ).toBeVisible();
  await expect(
    page.locator(".leaflet-rotate-pane .leaflet-fields-pane path"),
  ).toBeVisible();
  const alignment = await page.evaluate(() => {
    const map = window.__testMap;
    const expected = map.latLngToContainerPoint([50, 8]);
    const icon = document
      .querySelector(".user-location-marker")!
      .getBoundingClientRect();
    const container = map.getContainer().getBoundingClientRect();
    return Math.hypot(
      icon.x + icon.width / 2 - container.x - expected.x,
      icon.y + icon.height / 2 - container.y - expected.y,
    );
  });
  expect(alignment).toBeLessThan(2);
  await page
    .getByRole("button", {
      name: "Kompass ausschalten und Karte nach Norden ausrichten",
    })
    .click();
  await expectBearing(page, 0);
  await heading(page, 180);
  await expectBearing(page, 0);
});

test("Safari headings including north work on shared route maps", async ({
  page,
}) => {
  await page.goto("/share/test-token");
  await activate(page);
  await heading(page, 120, true);
  await expectBearing(page, 240);
  await heading(page, 0, true);
  await expect
    .poll(() =>
      page.evaluate(() =>
        Math.min(
          window.__testMap.getBearing(),
          360 - window.__testMap.getBearing(),
        ),
      ),
    )
    .toBeLessThan(0.3);
});

test("denied permission and missing absolute readings leave the map north", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.__permission = "denied";
  });
  await page
    .getByRole("button", { name: "Karte nach Kompass ausrichten", exact: true })
    .click();
  await expect(
    page.getByText("Kompasszugriff nicht erlaubt.", { exact: false }),
  ).toBeVisible();
  await expectBearing(page, 0);
  await page.evaluate(() => {
    window.__permission = "granted";
  });
  await page
    .getByRole("button", { name: "Karte nach Kompass ausrichten", exact: true })
    .click();
  await page.evaluate(() =>
    window.dispatchEvent(
      new DeviceOrientationEvent("deviceorientation", {
        alpha: 90,
        absolute: false,
      }),
    ),
  );
  await expect(
    page.getByRole("button", { name: "Kompass wird ermittelt – abbrechen" }),
  ).toBeVisible();
  await expectBearing(page, 0);
  await expect(
    page.getByText("Keine verlässlichen Kompassdaten verfügbar.", {
      exact: false,
    }),
  ).toBeVisible({ timeout: 10000 });
  await expect(
    page.getByRole("button", {
      name: "Karte nach Kompass ausrichten",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "false");
});

for (const action of [
  "Route zeichnen",
  "Feld zeichnen",
  "Standort auf der Karte setzen",
]) {
  test(`rotation pauses during ${action} and resumes after cancelling`, async ({
    page,
  }) => {
    await page.goto("/");
    await activate(page);
    await page.getByRole("button", { name: "Neues Element erstellen" }).click();
    await page.getByRole("button", { name: action, exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Kompass beim Zeichnen pausiert" }),
    ).toBeDisabled();
    await expectBearing(page, 0);
    await heading(page, 180);
    await expectBearing(page, 0);
    await page.getByRole("button", { name: "Abbrechen", exact: true }).click();
    await heading(page, 135);
    await expectBearing(page, 225);
  });
}

test("route points can be dragged after compass rotation and editor entry", async ({
  page,
}) => {
  await page.goto("/?route=1");
  await activate(page);
  await page.getByRole("button", { name: "Aktionen für Testroute" }).click();
  await page
    .getByRole("button", { name: "Route bearbeiten", exact: true })
    .click();
  await expectBearing(page, 0);
  await page
    .getByRole("button", { name: "Route bearbeiten – Menü einklappen" })
    .click();
  const marker = page.getByTitle("Punkt 2 auswählen oder verschieben");
  await expect(
    page.locator(".leaflet-pan-anim, .leaflet-zoom-anim"),
  ).toHaveCount(0);
  await marker.click({ trial: true });
  const box = (await marker.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 35,
    box.y + box.height / 2 + 25,
    { steps: 8 },
  );
  await page.mouse.up();
  const moved = (await marker.boundingBox())!;
  expect(moved.x - box.x).toBeCloseTo(35, 0);
  expect(moved.y - box.y).toBeCloseTo(25, 0);
  await page
    .getByRole("button", { name: "Route bearbeiten – Menü ausklappen" })
    .click();
  await expect(page.getByRole("button", { name: "Rückgängig" })).toBeEnabled();
});

test("browsers without a permission method can use absolute orientation", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    Object.defineProperty(DeviceOrientationEvent, "requestPermission", {
      value: undefined,
    }),
  );
  await activate(page);
  expect(await page.evaluate(() => window.__permissionCalls)).toBe(0);
});

test("cancelling a pending permission request cannot enable the compass later", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    Object.defineProperty(DeviceOrientationEvent, "requestPermission", {
      value: () =>
        new Promise((resolve) => {
          window.__resolvePermission = () => resolve("granted");
        }),
    }),
  );
  await page
    .getByRole("button", { name: "Karte nach Kompass ausrichten", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Kompass wird ermittelt – abbrechen" })
    .click();
  await page.evaluate(() => window.__resolvePermission());
  await heading(page, 90);
  await expectBearing(page, 0);
  await expect(
    page.getByRole("button", {
      name: "Karte nach Kompass ausrichten",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "false");
});

test("a stationary heading remains active and returning to the tab waits for fresh data", async ({
  page,
}) => {
  await page.goto("/");
  await activate(page);
  await page.clock.install();
  await page.clock.fastForward(9000);
  await expect(
    page.getByRole("button", {
      name: "Kompass ausschalten und Karte nach Norden ausrichten",
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await heading(page, 180);
  await expectBearing(page, 0);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(
    page.getByRole("button", { name: "Kompass wird ermittelt – abbrechen" }),
  ).toBeVisible();
  await heading(page, 180);
  await page.clock.runFor(1500);
  await expectBearing(page, 180);
});

test("new route points retain the tapped coordinates after compass rotation", async ({
  page,
}) => {
  await page.route("**/api/routes", (request) =>
    request.fulfill({
      json:
        request.request().method() === "POST"
          ? { ...request.request().postDataJSON(), id: 2, createdAt: null }
          : [route],
    }),
  );
  await page.goto("/");
  await activate(page);
  await page.getByRole("button", { name: "Neues Element erstellen" }).click();
  await page
    .getByRole("button", { name: "Route zeichnen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Route erstellen – Menü einklappen" })
    .click();
  await expectBearing(page, 0);
  const clicks = [
    { x: 210, y: 330 },
    { x: 270, y: 430 },
  ];
  const expected = await page.evaluate(
    (clicks) =>
      clicks.map((point) => {
        const { lat, lng } = window.__testMap.containerPointToLatLng([
          point.x,
          point.y,
        ]);
        return [lng, lat];
      }),
    clicks,
  );
  for (const position of clicks)
    await page.locator(".leaflet-container").click({ position });
  await expect(
    page.getByTitle(/^Punkt \d+ auswählen oder verschieben$/),
  ).toHaveCount(2);
  await page
    .getByRole("button", { name: "Route erstellen – Menü ausklappen" })
    .click();
  const savedRequest = page.waitForRequest(
    (request) =>
      request.url().endsWith("/api/routes") && request.method() === "POST",
  );
  await page.getByRole("button", { name: "Speichern", exact: true }).click();
  const coordinates = (await savedRequest).postDataJSON().geometry.coordinates;
  for (let index = 0; index < expected.length; index++) {
    expect(coordinates[index][0]).toBeCloseTo(expected[index][0], 6);
    expect(coordinates[index][1]).toBeCloseTo(expected[index][1], 6);
  }
  await expect(
    page.getByRole("button", { name: "Neues Element erstellen" }),
  ).toBeVisible();
  await heading(page, 90);
  await expectBearing(page, 270);
});
