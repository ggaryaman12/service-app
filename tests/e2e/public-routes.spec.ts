import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

test.describe.configure({ timeout: 90_000 });

async function expectNoAppError(page: Page) {
  await expect(
    page.getByText(/Application error|Internal Server Error|Unhandled Runtime Error/i)
  ).toHaveCount(0);
}

async function expectPublicPageHealthy(page: Page, path: string) {
  const response = await page.goto(path);

  expect(response?.ok(), `${path} should return a successful response`).toBe(true);
  await expectNoAppError(page);
}

test("home page renders public shell and customer entry points", async ({ page }) => {
  await expectPublicPageHealthy(page, "/");

  await expect(page.getByRole("link", { name: "JammuServe" })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Login$/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /^Register$/ }).first()).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
});

test("services page exposes search and category controls", async ({ page }) => {
  await expectPublicPageHealthy(page, "/services");

  await expect(
    page.getByRole("heading", {
      name: /Book trusted home services without the guesswork\.|Our Services/i
    })
  ).toBeVisible();
  await expect(page.getByPlaceholder(/Search services/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /^All( services)?$/i })).toBeVisible();
});

test("customer auth pages expose forms and link between login and register", async ({ page }) => {
  await expectPublicPageHealthy(page, "/customer/login");

  await expect(page.getByRole("heading", { name: /Welcome back|Customer login/i })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();

  const registerLink = page.getByRole("link", { name: /Create (an )?account/i });
  await expect(registerLink).toHaveAttribute("href", /\/customer\/register/);

  await expectPublicPageHealthy(page, "/customer/register?next=%2F");
  await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
  await expect(page.getByLabel("Name")).toBeVisible();
  await expect(page.getByLabel("Phone (optional)")).toBeVisible();
  await expect(page.getByLabel("Zone (optional)")).toBeVisible();
});

test("mobile shell keeps bottom navigation visible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expectPublicPageHealthy(page, "/");

  const bottomNav = page.getByRole("navigation", { name: "Bottom navigation" });
  await expect(bottomNav).toBeVisible();
  await expect(bottomNav.getByRole("link", { name: "Home" })).toBeVisible();
  await expect(bottomNav.getByRole("link", { name: "Bookings", exact: true })).toBeVisible();
  await expect(bottomNav.getByRole("link", { name: /Account|Profile/i })).toBeVisible();
});

test("open catalog API returns stable public contract", async ({ request }) => {
  const response = await request.get("/api/open/catalog");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("application/json");

  const body = await response.json();

  expect(body).toHaveProperty("data.categories");
  expect(body).toHaveProperty("data.services");
  expect(body).toHaveProperty("data.activeCategory");
  expect(body).toHaveProperty("meta.version");
  expect(body).toHaveProperty("meta.currency");
  expect(body).toHaveProperty("meta.paymentMode");
  expect(Array.isArray(body.data.categories)).toBe(true);
  expect(Array.isArray(body.data.services)).toBe(true);
  expect(typeof body.meta.version).toBe("string");
  expect(typeof body.meta.currency).toBe("string");
  expect(typeof body.meta.paymentMode).toBe("string");

  for (const category of body.data.categories) {
    expect(category).toHaveProperty("id");
  }

  for (const service of body.data.services) {
    expect(service).toHaveProperty("id");
  }
});
