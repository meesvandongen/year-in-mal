import { expect, type Page, test } from "@playwright/test";

// Pin "today" so the demo list and the default year are stable.
const TODAY = new Date("2026-10-25T12:00:00");

async function mockLoggedOut(page: Page) {
  await page.route("**/api/me", (route) =>
    route.fulfill({ status: 401, json: { error: "unauthenticated" } }),
  );
  await page.route("**/api/animelist", (route) =>
    route.fulfill({ status: 401, json: { error: "unauthenticated" } }),
  );
}

async function openDemo(page: Page) {
  await page.clock.setFixedTime(TODAY);
  await page.goto("/?demo");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("2025");
}

test.describe("landing", () => {
  test("invites visitors to log in or try the demo", async ({ page }) => {
    await mockLoggedOut(page);
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Your year in anime, wrapped.",
    );
    await expect(page.getByRole("link", { name: "Continue with MyAnimeList" })).toHaveAttribute(
      "href",
      "/api/login",
    );
    await page.getByRole("link", { name: "Try the demo" }).click();
    await expect(page).toHaveURL(/\?demo/);
    await expect(page.getByText("A demo year in anime")).toBeVisible();
  });

  test("explains a failed login and cleans up the URL", async ({ page }) => {
    await mockLoggedOut(page);
    await page.goto("/?auth_error=denied");

    await expect(page.getByRole("alert")).toContainText("declined access");
    await expect(page).toHaveURL(/\/$/);
  });

  test("offers a retry when MAL is down", async ({ page }) => {
    await page.route("**/api/*", (route) =>
      route.fulfill({ status: 502, json: { error: "mal_unavailable" } }),
    );
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "MyAnimeList isn't answering" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });

  test("sends the login button to the OAuth flow", async ({ page }) => {
    const response = await page.request.get("/api/login", { maxRedirects: 0 });
    expect(response.status()).toBe(302);
    const location = new URL(response.headers().location!);
    expect(location.origin + location.pathname).toBe("https://myanimelist.net/v1/oauth2/authorize");
    expect(location.searchParams.get("state")).toBeTruthy();
    expect(location.searchParams.get("redirect_uri")).toBe("http://localhost:8788/api/callback");
  });
});

test.describe("demo story", () => {
  test("tells the story of last year", async ({ page }) => {
    await openDemo(page);

    for (const name of [
      "2025, by the numbers",
      "Your top 5 of 2025",
      "Your hot takes",
      "That's a wrap on 2025",
    ]) {
      await expect(page.getByRole("heading", { name })).toBeAttached();
    }
    await expect(page.locator("#favourites a[href*='myanimelist.net/anime/']")).toHaveCount(5);
  });

  test("switches years", async ({ page }) => {
    await openDemo(page);

    await page.getByRole("combobox", { name: "Year" }).selectOption("2024");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("2024");
    await expect(page.getByRole("heading", { name: /^Your top \d of 2024$/ })).toBeAttached();
  });

  test("steps through chapters with the keyboard", async ({ page }) => {
    await openDemo(page);

    await page.keyboard.press("j");
    await expect(page.locator("#numbers")).toBeInViewport({ ratio: 0.5 });
    await page.keyboard.press("j");
    await expect(page.locator("#rhythm")).toBeInViewport({ ratio: 0.5 });
    await page.keyboard.press("k");
    await expect(page.locator("#numbers")).toBeInViewport({ ratio: 0.5 });
  });

  test("compares how far behind the broadcast you were", async ({ page }) => {
    await openDemo(page);

    const chapter = page.locator("#catch-up");
    await expect(chapter.getByRole("heading", { name: /behind the broadcast$/ })).toBeAttached();
    await expect(
      chapter.getByRole("img", { name: /per year: .*2024 .*2025 .*2026/ }),
    ).toBeAttached();
  });

  test("lists everything behind a highlight", async ({ page }) => {
    await openDemo(page);

    await page.locator("#popularity").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "See all by popularity" }).click();
    const sheet = page.getByRole("dialog", { name: "By popularity" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("listitem")).toHaveCount(46);

    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
  });

  test("shows the anime in a genre", async ({ page }) => {
    await openDemo(page);

    const genres = page.locator("#genres");
    await genres.scrollIntoViewIfNeeded();
    const top = genres.getByRole("button").first();
    const name = (await top.innerText()).split("\n")[0]!.replace(/^\d+\s*/, "");
    await top.click();
    const sheet = page.getByRole("dialog", { name });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("listitem").first()).toBeVisible();

    await sheet.getByRole("button", { name: "Close" }).click();
    await expect(sheet).toBeHidden();
  });

  test("opens the account menu", async ({ page }) => {
    await openDemo(page);

    await page.getByRole("button", { name: "Account" }).click();
    await expect(page.getByRole("link", { name: "Exit demo" })).toBeVisible();
  });

  test("never scrolls sideways", async ({ page }) => {
    await openDemo(page);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
});
