import { expect, test, type Browser } from "@playwright/test";
import nextEnv from "@next/env";
import { encode } from "next-auth/jwt";

import { hashPassword } from "../../src/lib/password";
import { prisma } from "../../src/lib/prisma";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

test.describe.configure({ timeout: 90_000 });

async function openStaffSession(
  browser: Browser,
  baseURL: string | undefined,
  user: { id: string; name: string; email: string; role: string }
) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is required for shell tests");

  const sessionToken = await encode({
    secret,
    salt: "authjs.session-token",
    token: {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });

  const context = await browser.newContext({ baseURL });
  await context.addCookies([
    {
      name: "authjs.session-token",
      value: sessionToken,
      url: baseURL ?? "http://127.0.0.1:3100",
      httpOnly: true,
      sameSite: "Lax"
    }
  ]);

  return context;
}

test("public shell stays mounted while navigating between public pages", async ({ page }) => {
  await page.goto("/services");
  await expect(
    page.getByRole("heading", { name: /Book trusted home services without the guesswork\./i })
  ).toBeVisible();

  await page.goto("/");
  await expect(page.getByLabel("Preparing JammuServe")).toBeHidden({ timeout: 15_000 });

  const shell = page.locator("[data-public-shell]");
  const header = page.locator("[data-public-shell] header").first();
  await expect(shell).toBeVisible();
  await expect(header).toBeVisible();

  await header.evaluate((element) => {
    element.setAttribute("data-shell-probe", "public-header-stable");
  });

  await page.getByRole("link", { name: "Services" }).first().click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(
    page.getByRole("heading", {
      name: /Book trusted home services without the guesswork\.|Our Services/i
    })
  ).toBeVisible();
  await expect(page.locator('[data-shell-probe="public-header-stable"]')).toHaveCount(1);
});

test("admin sidebar and header stay mounted while navigating catalog pages", async ({
  browser,
  baseURL
}) => {
  const suffix = Date.now();
  const admin = await prisma.user.create({
    data: {
      name: "Persistent Admin",
      email: `persistent-admin-${suffix}@example.com`,
      passwordHash: hashPassword(`Password-${suffix}!`),
      role: "ADMIN"
    }
  });

  const context = await openStaffSession(browser, baseURL, admin);
  const page = await context.newPage();

  try {
    await expect((await page.request.get("/catalog/services")).ok()).toBe(true);
    await page.goto("/catalog/categories");

    await expect(page.locator("[data-admin-shell]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();

    await page.locator("[data-admin-shell] aside").evaluate((element) => {
      element.setAttribute("data-shell-probe", "admin-sidebar-stable");
    });
    await page.locator("[data-admin-shell] header").evaluate((element) => {
      element.setAttribute("data-shell-probe", "admin-header-stable");
    });

    await page
      .getByRole("navigation", { name: "Staff navigation" })
      .getByRole("link", { name: /Services/i })
      .click();

    await expect(page.getByRole("heading", { name: "Services" })).toBeVisible();
    await expect(page.locator('[data-shell-probe="admin-sidebar-stable"]')).toHaveCount(1);
    await expect(page.locator('[data-shell-probe="admin-header-stable"]')).toHaveCount(1);
  } finally {
    await context.close();
    await prisma.user.deleteMany({ where: { id: admin.id } });
  }
});

test("staff shell stays mounted while navigating manager feature routes", async ({
  browser,
  baseURL
}) => {
  const suffix = Date.now();
  const accessRole = await prisma.managerAccessRole.create({
    data: {
      name: `Persistent Manager Role ${suffix}`,
      description: "Manager shell persistence e2e role",
      permissions: ["bookings.view", "dispatch.view", "dispatch.assign"]
    }
  });
  const manager = await prisma.user.create({
    data: {
      name: "Persistent Manager",
      email: `persistent-manager-${suffix}@example.com`,
      passwordHash: hashPassword(`Password-${suffix}!`),
      role: "MANAGER",
      managerAccessRoleId: accessRole.id
    }
  });

  const context = await openStaffSession(browser, baseURL, manager);
  const page = await context.newPage();

  try {
    await expect((await page.request.get("/dispatch")).ok()).toBe(true);
    await expect((await page.request.get("/bookings")).ok()).toBe(true);
    await page.goto("/dashboard");

    const shell = page.locator("[data-staff-shell]");
    await expect(shell).toBeVisible();
    await shell.evaluate((element) => {
      element.setAttribute("data-shell-probe", "staff-shell-stable");
    });

    await page.getByRole("link", { name: "Dispatch screen" }).click();
    await expect(page.getByRole("heading", { name: "Dispatch screen" })).toBeVisible();
    await expect(page.locator('[data-shell-probe="staff-shell-stable"]')).toHaveCount(1);

    await page.getByRole("link", { name: "View all bookings" }).click();
    await expect(page.getByRole("heading", { name: "Bookings" })).toBeVisible();
    await expect(page.locator('[data-shell-probe="staff-shell-stable"]')).toHaveCount(1);
  } finally {
    await context.close();
    await prisma.user.deleteMany({ where: { id: manager.id } });
    await prisma.managerAccessRole.deleteMany({ where: { id: accessRole.id } });
  }
});

test("admin internal navigation uses a full-screen loader without remounting chrome", async ({
  browser,
  baseURL
}) => {
  const suffix = Date.now();
  const admin = await prisma.user.create({
    data: {
      name: "Loader Admin",
      email: `loader-admin-${suffix}@example.com`,
      passwordHash: hashPassword(`Password-${suffix}!`),
      role: "ADMIN"
    }
  });

  const context = await openStaffSession(browser, baseURL, admin);
  const page = await context.newPage();

  try {
    await expect((await page.request.get("/catalog/services")).ok()).toBe(true);
    await page.goto("/catalog/categories");
    await page.locator("[data-admin-shell] aside").evaluate((element) => {
      element.setAttribute("data-shell-probe", "admin-loader-sidebar-stable");
    });

    await page
      .getByRole("navigation", { name: "Staff navigation" })
      .getByRole("link", { name: /Services/i })
      .click();

    const overlay = page.locator("[data-route-transition-overlay]");
    await expect(overlay).toBeVisible();

    const overlayBox = await overlay.boundingBox();
    const viewport = page.viewportSize();
    expect(overlayBox?.x).toBeLessThanOrEqual(1);
    expect(overlayBox?.y).toBeLessThanOrEqual(1);
    expect(overlayBox?.width).toBeGreaterThanOrEqual((viewport?.width ?? 0) - 2);
    expect(overlayBox?.height).toBeGreaterThanOrEqual((viewport?.height ?? 0) - 2);
    await expect(page.locator('[data-shell-probe="admin-loader-sidebar-stable"]')).toHaveCount(1);

    await expect(page.getByRole("heading", { name: "Services" })).toBeVisible();
    await expect(overlay).toBeHidden();
  } finally {
    await context.close();
    await prisma.user.deleteMany({ where: { id: admin.id } });
  }
});
