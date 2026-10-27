import { expect, test, type Page } from "@playwright/test";

declare global {
  interface Window {
    __wakeTest: {
      requests: number;
      releases: number;
      reject: boolean;
      defer: boolean;
      locks: Array<{ released: boolean; release: () => Promise<void> }>;
      resolve: (index: number) => void;
    };
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(DeviceOrientationEvent, "requestPermission", {
      configurable: true,
      value: () => Promise.resolve("granted"),
    });
    const pending: Array<() => void> = [];
    const state = (window.__wakeTest = {
      requests: 0,
      releases: 0,
      reject: false,
      defer: false,
      locks: [] as Window["__wakeTest"]["locks"],
      resolve: (index: number) => pending[index](),
    });
    class FakeWakeLock extends EventTarget {
      released = false;
      type = "screen";
      async release() {
        if (this.released) return;
        this.released = true;
        state.releases++;
        this.dispatchEvent(new Event("release"));
      }
    }
    Object.defineProperty(navigator, "wakeLock", {
      configurable: true,
      value: {
        request: async (type: string) => {
          if (type !== "screen") throw new Error("Expected a screen wake lock");
          state.requests++;
          if (state.reject) throw new DOMException("Denied", "NotAllowedError");
          const lock = new FakeWakeLock();
          state.locks.push(lock);
          if (state.defer)
            await new Promise<void>((resolve) => pending.push(resolve));
          return lock;
        },
      },
    });
    navigator.geolocation.watchPosition = () => 1;
    navigator.geolocation.clearWatch = () => {};
  });
  await page.route("**/api/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({
      json:
        path === "/api/auth/session"
          ? { authenticated: true }
          : path === "/api/meta"
            ? {}
            : path.startsWith("/api/shared/routes/")
              ? {
                  id: 1,
                  name: "Testroute",
                  geometry: {
                    type: "LineString",
                    coordinates: [
                      [8, 50],
                      [8.001, 50.001],
                    ],
                  },
                }
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

const offButton = (page: Page) =>
  page.getByRole("button", { name: "Display wach halten", exact: true });
const onButton = (page: Page) =>
  page.getByRole("button", {
    name: "Display wach halten ausschalten",
    exact: true,
  });
const pendingButton = (page: Page) =>
  page.getByRole("button", {
    name: "Display wach halten wird aktiviert – abbrechen",
  });

async function setHidden(page: Page, hidden: boolean) {
  await page.evaluate((hidden) => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: hidden,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  }, hidden);
}

for (const path of ["/", "/share/test-route"]) {
  test(`navigation enables the shared wake lock control on ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    await page
      .getByRole("button", {
        name: "Navigationsmodus einschalten",
        exact: true,
      })
      .click();
    await expect(onButton(page)).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => window.__wakeTest.requests)).toBe(1);
    // The screen setting remains independently controllable during navigation.
    await onButton(page).click();
    await expect(offButton(page)).toHaveAttribute("aria-pressed", "false");
    await expect
      .poll(() => page.evaluate(() => window.__wakeTest.releases))
      .toBe(1);
    await expect(
      page.getByRole("button", {
        name: "Navigationsmodus wartet auf Standort – ausschalten",
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test(`wake lock is opt-in and can be switched off on ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(offButton(page)).toHaveAttribute("aria-pressed", "false");
    expect(await page.evaluate(() => window.__wakeTest.requests)).toBe(0);
    await offButton(page).click();
    await expect(onButton(page)).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => window.__wakeTest.requests)).toBe(1);
    await onButton(page).click();
    await expect(offButton(page)).toHaveAttribute("aria-pressed", "false");
    await expect
      .poll(() => page.evaluate(() => window.__wakeTest.releases))
      .toBe(1);
    await setHidden(page, true);
    await setHidden(page, false);
    expect(await page.evaluate(() => window.__wakeTest.requests)).toBe(1);
  });
}

test("navigation preserves an already enabled screen lock without duplicating requests", async ({
  page,
}) => {
  await page.goto("/");
  await offButton(page).click();
  await expect(onButton(page)).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Navigationsmodus einschalten", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Navigationsmodus wartet auf Standort – ausschalten",
    }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => window.__wakeTest.requests)).toBe(1);
  await page
    .getByRole("button", {
      name: "Navigationsmodus wartet auf Standort – ausschalten",
    })
    .click();
  await expect(onButton(page)).toHaveAttribute("aria-pressed", "true");
});

test("denied compass permission does not enable the screen lock", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    Object.defineProperty(DeviceOrientationEvent, "requestPermission", {
      value: () => Promise.resolve("denied"),
    }),
  );
  await page
    .getByRole("button", { name: "Navigationsmodus einschalten", exact: true })
    .click();
  await expect(
    page.getByText("Kompasszugriff nicht erlaubt.", { exact: false }),
  ).toBeVisible();
  await expect(offButton(page)).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate(() => window.__wakeTest.requests)).toBe(0);
});

test("a rejected automatic wake lock leaves navigation usable", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.__wakeTest.reject = true;
  });
  await page
    .getByRole("button", { name: "Navigationsmodus einschalten", exact: true })
    .click();
  await expect(
    page.getByText("Display konnte nicht wach gehalten werden.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(offButton(page)).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByRole("button", {
      name: "Navigationsmodus wartet auf Standort – ausschalten",
    }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("switching apps releases the lock and returning reacquires it", async ({
  page,
}) => {
  await page.goto("/");
  await offButton(page).click();
  await expect(onButton(page)).toHaveAttribute("aria-pressed", "true");
  await setHidden(page, true);
  await expect
    .poll(() => page.evaluate(() => window.__wakeTest.releases))
    .toBe(1);
  await expect(onButton(page)).toHaveAttribute("aria-pressed", "false");
  await setHidden(page, false);
  await expect(onButton(page)).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => window.__wakeTest.requests)).toBe(2);
});

test("a denied request is shown as off and can be retried", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.__wakeTest.reject = true;
  });
  await offButton(page).click();
  await expect(
    page.getByText("Display konnte nicht wach gehalten werden.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(offButton(page)).toHaveAttribute("aria-pressed", "false");
  await page.evaluate(() => {
    window.__wakeTest.reject = false;
  });
  await offButton(page).click();
  await expect(onButton(page)).toHaveAttribute("aria-pressed", "true");
});

test("unsupported browsers show an explanation without requesting a lock", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    Object.defineProperty(navigator, "wakeLock", { value: undefined }),
  );
  await offButton(page).click();
  await expect(
    page.getByText("Display wach halten ist hier nicht verfügbar.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(offButton(page)).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate(() => window.__wakeTest.requests)).toBe(0);
});

test("system release switches off rather than repeatedly fighting the device", async ({
  page,
}) => {
  await page.goto("/");
  await offButton(page).click();
  await expect(onButton(page)).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => window.__wakeTest.locks[0].release());
  await expect(offButton(page)).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByText("Das Gerät hat „Display wach halten“ beendet."),
  ).toBeVisible();
  await setHidden(page, true);
  await setHidden(page, false);
  expect(await page.evaluate(() => window.__wakeTest.requests)).toBe(1);
});

test("cancelling a pending request releases its late result", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.__wakeTest.defer = true;
  });
  await offButton(page).click();
  await expect(pendingButton(page)).toHaveAttribute("aria-pressed", "false");
  await pendingButton(page).click();
  await page.evaluate(() => window.__wakeTest.resolve(0));
  await expect(offButton(page)).toHaveAttribute("aria-pressed", "false");
  await expect
    .poll(() => page.evaluate(() => window.__wakeTest.releases))
    .toBe(1);
});

for (const deferred of [false, true]) {
  test(`leaving the map releases ${deferred ? "pending" : "active"} locks`, async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate((defer) => {
      window.__wakeTest.defer = defer;
    }, deferred);
    await offButton(page).click();
    await expect(deferred ? pendingButton(page) : onButton(page)).toBeVisible();
    await page
      .getByRole("button", { name: "Navigation öffnen oder schließen" })
      .click();
    await page.getByRole("link", { name: "Routen", exact: true }).click();
    await expect(page).toHaveURL(/\/routes$/);
    if (deferred) await page.evaluate(() => window.__wakeTest.resolve(0));
    await expect
      .poll(() => page.evaluate(() => window.__wakeTest.releases))
      .toBe(1);
    await setHidden(page, true);
    await setHidden(page, false);
    expect(await page.evaluate(() => window.__wakeTest.requests)).toBe(1);
  });
}

test("a stale request from before a tab switch cannot replace the current lock", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.__wakeTest.defer = true;
  });
  await offButton(page).click();
  await expect
    .poll(() => page.evaluate(() => window.__wakeTest.requests))
    .toBe(1);
  await setHidden(page, true);
  await setHidden(page, false);
  await expect
    .poll(() => page.evaluate(() => window.__wakeTest.requests))
    .toBe(2);
  await page.evaluate(() => window.__wakeTest.resolve(1));
  await expect(onButton(page)).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => window.__wakeTest.resolve(0));
  await expect
    .poll(() =>
      page.evaluate(() => window.__wakeTest.locks.map((lock) => lock.released)),
    )
    .toEqual([true, false]);
  await expect(onButton(page)).toHaveAttribute("aria-pressed", "true");
});
