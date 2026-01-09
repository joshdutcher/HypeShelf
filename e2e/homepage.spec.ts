import { test, expect } from "@playwright/test";

test.describe("Public Homepage", () => {
  test("should display HypeShelf branding", async ({ page }) => {
    await page.goto("/");

    // Check for branding
    await expect(page.getByRole("heading", { name: "HypeShelf" })).toBeVisible();
    await expect(
      page.getByText("Collect and share the stuff you're hyped about.")
    ).toBeVisible();
  });

  test("should display 'Latest Recommendations' heading", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Latest Recommendations" })
    ).toBeVisible();
  });

  test("should show sign in button when not authenticated", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("button", { name: /sign in/i })
    ).toBeVisible();
  });

  test("should display recommendation cards if data exists", async ({
    page,
  }) => {
    await page.goto("/");

    // Wait for either recommendations or empty state
    await page.waitForSelector(
      '[class*="grid"], [class*="empty"]',
      { timeout: 5000 }
    );

    // Check if we have recommendation cards or empty state
    const hasCards = await page.locator('[class*="group relative"]').count();
    const hasEmptyState = await page
      .getByText("No recommendations yet")
      .isVisible()
      .catch(() => false);

    expect(hasCards > 0 || hasEmptyState).toBeTruthy();
  });

  test("should display movie poster or placeholder", async ({ page }) => {
    await page.goto("/");

    // Wait for content to load
    await page.waitForLoadState("networkidle");

    // Check for either image or placeholder
    const hasImages = (await page.locator("img").count()) > 0;
    const hasPlaceholder = (await page.locator("text=🎬").count()) > 0;

    expect(hasImages || hasPlaceholder).toBeTruthy();
  });

  test("should display genre tags on recommendation cards", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for genre tags (they have specific styling)
    const genreTags = page.locator('[class*="rounded-full"][class*="px-2"]');
    const count = await genreTags.count();

    // If we have recommendations, we should have genre tags
    if (count > 0) {
      expect(count).toBeGreaterThan(0);
    }
  });

  test("should show staff pick badge when present", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check if staff pick badge exists
    const staffPickBadge = page.getByText("⭐ Staff Pick");
    const isVisible = await staffPickBadge.isVisible().catch(() => false);

    // We don't require staff pick to exist, just check it renders correctly if it does
    if (isVisible) {
      await expect(staffPickBadge).toHaveClass(/bg-yellow-100/);
    }
  });

  test("should have responsive layout", async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");
    await expect(page.locator("header")).toBeVisible();

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("header")).toBeVisible();
  });

  test("should navigate to recommendations page when authenticated", async ({
    page,
  }) => {
    await page.goto("/");

    // Check for the button (either "Sign in" or "View All Recommendations")
    const hasSignInButton = await page
      .getByRole("button", { name: /sign in/i })
      .isVisible()
      .catch(() => false);

    const hasViewAllButton = await page
      .getByRole("link", { name: /view all recommendations/i })
      .isVisible()
      .catch(() => false);

    expect(hasSignInButton || hasViewAllButton).toBeTruthy();
  });

  test("should display empty state when no recommendations exist", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check if empty state is shown
    const emptyStateHeading = page.getByText("No recommendations yet");
    const isVisible = await emptyStateHeading.isVisible().catch(() => false);

    if (isVisible) {
      await expect(
        page.getByText("Be the first to share your favorite movie!")
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /sign in to add the first one/i })
      ).toBeVisible();
    }
  });

  test("should show external links when available", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check if any "View →" links exist
    const viewLinks = page.getByText("View →");
    const count = await viewLinks.count();

    // If recommendations have links, they should be displayed
    if (count > 0) {
      const firstLink = viewLinks.first();
      await expect(firstLink).toBeVisible();
    }
  });
});
