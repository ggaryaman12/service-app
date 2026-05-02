import { expect, test, type Browser } from "@playwright/test";
import nextEnv from "@next/env";
import { encode } from "next-auth/jwt";

import { hashPassword } from "../../src/lib/password";
import { prisma } from "../../src/lib/prisma";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

async function openAdminSession(
  browser: Browser,
  baseURL: string | undefined,
  user: { id: string; name: string; email: string; role: string }
) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is required for admin dashboard tests");

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

test("admin overview renders command-center shell and operational widgets", async ({
  browser,
  baseURL
}) => {
  const suffix = Date.now();
  const admin = await prisma.user.create({
    data: {
      name: "Dashboard Admin",
      email: `dashboard-admin-${suffix}@example.com`,
      passwordHash: hashPassword(`Password-${suffix}!`),
      role: "ADMIN"
    }
  });

  const context = await openAdminSession(browser, baseURL, admin);
  const page = await context.newPage();

  try {
    await page.goto("/dashboard");

    const adminNav = page.getByRole("navigation", { name: "Staff navigation" });
    await expect(adminNav).toBeVisible();
    await expect(adminNav.getByRole("link", { name: /Dashboard/i })).toBeVisible();
    await expect(adminNav.getByRole("link", { name: /Categories/i })).toBeVisible();
    await expect(adminNav.getByRole("link", { name: /Integration Channels/i })).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();
    await expect(page.getByText("Pending queue")).toBeVisible();
    await expect(page.getByText("Online workers")).toBeVisible();
    await expect(page.getByText("Active jobs")).toBeVisible();
    await expect(page.getByText("Managed value")).toBeVisible();
    await expect(page.getByText("Live booking queue")).toBeVisible();
  } finally {
    await context.close();
    await prisma.user.deleteMany({ where: { id: admin.id } });
  }
});

test("admin catalog pages render polished workspaces and route transition loader", async ({
  browser,
  baseURL
}) => {
  const suffix = Date.now();
  const admin = await prisma.user.create({
    data: {
      name: "Catalog Admin",
      email: `catalog-admin-${suffix}@example.com`,
      passwordHash: hashPassword(`Password-${suffix}!`),
      role: "ADMIN"
    }
  });
  const category = await prisma.category.create({
    data: {
      name: `Premium AC ${suffix}`,
      slug: `premium-ac-${suffix}`,
      active: true
    }
  });
  const service = await prisma.service.create({
    data: {
      categoryId: category.id,
      name: `AC Deep Clean ${suffix}`,
      description: "Full coil cleaning, filter wash, and cooling inspection.",
      basePrice: 999,
      estimatedMinutes: 75
    }
  });

  const context = await openAdminSession(browser, baseURL, admin);
  const page = await context.newPage();

  try {
    await page.goto("/catalog/categories");

    await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();
    await expect(page.getByText("Category workspace")).toBeVisible();
    await expect(page.getByText("Live categories")).toBeVisible();
    await expect(page.getByText(category.name)).toBeVisible();

    await page
      .getByRole("navigation", { name: "Staff navigation" })
      .getByRole("link", { name: /Services/i })
      .click();
    await expect(page.getByRole("heading", { name: "Services" })).toBeVisible();
    await expect(page.getByText("Service workspace")).toBeVisible();
    await expect(page.getByText(service.name)).toBeVisible();

    await page
      .getByRole("navigation", { name: "Staff navigation" })
      .getByRole("link", { name: /Categories/i })
      .click();
    const overlay = page.locator("[data-route-transition-overlay]");
    await expect(overlay).toBeVisible();
    await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();
    await expect(overlay).toBeHidden();
  } finally {
    await context.close();
    await prisma.service.deleteMany({ where: { id: service.id } });
    await prisma.category.deleteMany({ where: { id: category.id } });
    await prisma.user.deleteMany({ where: { id: admin.id } });
  }
});
