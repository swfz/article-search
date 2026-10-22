import { expect, test } from "@playwright/test";

test.describe("検索", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // MSW の Service Worker が有効になってから検索する(未登録だと Algolia へ実通信してしまう)
    await page.waitForFunction(
      () => navigator.serviceWorker.controller !== null,
    );
  });

  test("検索語 msw でハイライト付きの結果カードを表示する", async ({
    page,
  }) => {
    await page.getByPlaceholder("Search").fill("msw");

    const cards = page.getByTestId("hit-card");
    await expect(cards.first()).toBeVisible();
    await expect(cards.first().locator("mark").first()).toHaveText(/msw/i);
  });

  test("md ボタンで Markdown 形式のリンクをクリップボードにコピーする", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.getByPlaceholder("Search").fill("msw");

    const card = page.getByTestId("hit-card").first();
    await expect(card).toBeVisible();
    const url = await card.locator("a").first().getAttribute("href");
    const title = await card.locator("[class*=title]").innerText();

    await card.getByRole("button", { name: "md" }).click();

    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(`[${title}](${url})`);
  });
});
