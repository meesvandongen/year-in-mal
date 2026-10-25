import { type BrowserContext, expect, type Page, test } from "@playwright/test";

/**
 * Logs into a real MyAnimeList account, puts a few known anime on its list
 * and checks they show up in the recap.
 *
 * Needs MAL_USERNAME and MAL_PASSWORD, plus the functions' CLIENT_ID and
 * CLIENT_SECRET (in `.dev.vars`) for a MAL API client that allows the
 * redirect URL http://localhost:8788/api/callback.
 */
const { MAL_USERNAME, MAL_PASSWORD } = process.env;
const API_URL = "https://api.myanimelist.net/v2";

// Finished in a year the test account doesn't otherwise use, best first.
const SEED = [
  {
    id: 5114,
    title: /Fullmetal Alchemist: Brotherhood/i,
    score: 10,
    episodes: 64,
    date: "2012-02-14",
  },
  { id: 9253, title: /Steins;Gate/i, score: 9, episodes: 24, date: "2012-06-03" },
  { id: 1, title: /Cowboy Bebop/i, score: 8, episodes: 26, date: "2012-11-21" },
];

test.skip(!MAL_USERNAME || !MAL_PASSWORD, "Set MAL_USERNAME and MAL_PASSWORD to run");
test.describe.configure({ mode: "serial" });
// Traces record typed values, and failure reports are uploaded from CI.
test.use({ trace: "off" });

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * MAL shows a privacy dialog to new visitors, followed by a confirmation that
 * also blocks the page until closed.
 */
async function dismissPrivacyDialog(page: Page) {
  const dialog = page.locator("#qc-cmp2-container");
  const confirm = dialog.getByRole("button", { name: /^(confirm|agree|accept( all)?)$/i });
  const shown = await confirm.waitFor({ timeout: 10_000 }).then(
    () => true,
    () => false,
  );
  if (!shown) return;
  await confirm.click();
  await dialog
    .getByRole("button", { name: /close success modal/i })
    .click({ timeout: 5_000 })
    .catch(() => {});
}

async function logIntoMal(page: Page) {
  await page.waitForURL(/myanimelist\.net\/login\.php/);
  await dismissPrivacyDialog(page);
  await page.locator("#loginUserName").fill(MAL_USERNAME!);
  // Set directly rather than typed, so the password stays out of reports.
  await page
    .locator("#login-password")
    .evaluate((input: HTMLInputElement, password) => (input.value = password), MAL_PASSWORD!);
  await page.locator('input[type="submit"][value="Login"]').click();

  const error = page.locator(".badresult");
  await Promise.race([
    page.waitForURL((url) => !url.pathname.startsWith("/login.php"), { timeout: 30_000 }),
    error.first().waitFor({ timeout: 30_000 }),
  ]);
  if (page.url().includes("/login.php")) {
    throw new Error(`MyAnimeList refused the login: ${await error.first().innerText()}`);
  }
}

/** The MAL access token, read from the app's signed session cookie. */
async function accessToken(context: BrowserContext) {
  const cookie = (await context.cookies()).find((c) => c.name === "access_token");
  if (!cookie) throw new Error("Not logged in: no access_token cookie");
  const signed = decodeURIComponent(cookie.value);
  return signed.slice(0, signed.lastIndexOf("."));
}

test("logs in with MyAnimeList and recaps the list", async ({ page, context }) => {
  test.setTimeout(120_000);

  await test.step(
    "log in",
    async () => {
      await page.goto("/");
      await page.getByRole("link", { name: "Continue with MyAnimeList" }).click();
      await logIntoMal(page);

      // MAL asks for consent the first time an account uses an API client.
      if (page.url().includes("/oauth2/authorize")) {
        await page.getByRole("button", { name: "Allow" }).click();
      }
      await page.waitForURL("http://localhost:8788/**");
      expect(new URL(page.url()).searchParams.get("auth_error")).toBeNull();
    },
    { box: true },
  );

  let year = 0;
  await test.step("seed the list", async () => {
    const token = await accessToken(context);
    for (const anime of SEED) {
      const response = await page.request.patch(`${API_URL}/anime/${anime.id}/my_list_status`, {
        headers: { authorization: `Bearer ${token}` },
        form: {
          status: "completed",
          score: String(anime.score),
          num_watched_episodes: String(anime.episodes),
          start_date: anime.date,
          finish_date: anime.date,
        },
      });
      expect(response.ok(), await response.text()).toBe(true);
      const status = (await response.json()) as { finish_date?: string; updated_at: string };
      year = Number((status.finish_date ?? status.updated_at).slice(0, 4));
    }
  });

  await test.step("show the seeded anime", async () => {
    await page.reload();
    await expect(
      page.getByText(new RegExp(`^${escape(MAL_USERNAME!)}'s year in anime$`, "i")),
    ).toBeVisible({ timeout: 30_000 });

    await page.getByRole("combobox", { name: "Year" }).selectOption(String(year));
    await expect(page.getByRole("heading", { level: 1 })).toContainText(String(year));

    const favourites = page.locator("#favourites");
    await expect(favourites.getByRole("link").first()).toContainText(SEED[0]!.title);
    for (const anime of SEED) {
      await expect(favourites.getByRole("link", { name: anime.title })).toBeAttached();
    }
  });

  await test.step("log out", async () => {
    await page.getByRole("button", { name: "Account" }).click();
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page.getByRole("link", { name: "Continue with MyAnimeList" })).toBeVisible();
    expect((await page.request.get("/api/me")).status()).toBe(401);
  });
});
