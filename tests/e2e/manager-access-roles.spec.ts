import { expect, test, type Browser, type Page } from "@playwright/test";
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
  if (!secret) throw new Error("NEXTAUTH_SECRET is required for access role tests");

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

async function expectJsonError(response: Awaited<ReturnType<Page["request"]["get"]>>, status: number) {
  expect(response.status()).toBe(status);
  const body = await response.json();
  expect(body.error?.code).toBe("FORBIDDEN");
}

async function cleanupAccessRoleFixtures(suffix: number, userIds: string[]) {
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$executeRawUnsafe(
    "DELETE FROM `ManagerAccessRole` WHERE `name` LIKE ?",
    `%${suffix}%`
  ).catch(() => undefined);
}

test("admin can create roles, create managers, and update manager role assignment", async ({
  browser,
  baseURL
}) => {
  const suffix = Date.now();
  const password = `Password-${suffix}!`;
  const userIds: string[] = [];

  const admin = await prisma.user.create({
    data: {
      name: "Role Admin",
      email: `role-admin-${suffix}@example.com`,
      passwordHash: hashPassword(password),
      role: "ADMIN"
    }
  });
  userIds.push(admin.id);

  const context = await openStaffSession(browser, baseURL, admin);
  const page = await context.newPage();

  try {
    const bookingRoleResponse = await page.request.post("/api/app/roles", {
      data: {
        name: `Booking Desk ${suffix}`,
        description: "Can view booking workspace only",
        permissions: ["bookings.view", "bookings.financials"]
      }
    });
    expect(bookingRoleResponse.status()).toBe(201);
    const bookingRole = (await bookingRoleResponse.json()).data;

    const dispatchRoleResponse = await page.request.post("/api/app/roles", {
      data: {
        name: `Dispatch Lead ${suffix}`,
        description: "Can dispatch bookings",
        permissions: ["bookings.view", "dispatch.view", "dispatch.assign"]
      }
    });
    expect(dispatchRoleResponse.status()).toBe(201);
    const dispatchRole = (await dispatchRoleResponse.json()).data;

    const createManagerResponse = await page.request.post("/api/app/managers", {
      data: {
        name: "Access Manager",
        email: `access-manager-${suffix}@example.com`,
        password,
        phone: "9999999999",
        region: "Gandhi Nagar",
        accessRoleId: bookingRole.id
      }
    });
    expect(createManagerResponse.status()).toBe(201);
    const manager = (await createManagerResponse.json()).data;
    userIds.push(manager.id);
    expect(manager.managerAccessRole.id).toBe(bookingRole.id);

    const updateManagerResponse = await page.request.patch(`/api/app/managers/${manager.id}`, {
      data: { accessRoleId: dispatchRole.id, region: "Gandhi Nagar" }
    });
    expect(updateManagerResponse.status()).toBe(200);
    const updatedManager = (await updateManagerResponse.json()).data;
    expect(updatedManager.managerAccessRole.id).toBe(dispatchRole.id);
  } finally {
    await context.close();
    await cleanupAccessRoleFixtures(suffix, userIds);
  }
});

test("manager access profiles gate feature routes and APIs", async ({ browser, baseURL }) => {
  const suffix = Date.now();
  const password = `Password-${suffix}!`;
  const userIds: string[] = [];

  const admin = await prisma.user.create({
    data: {
      name: "Gate Admin",
      email: `gate-admin-${suffix}@example.com`,
      passwordHash: hashPassword(password),
      role: "ADMIN"
    }
  });
  const noRoleManager = await prisma.user.create({
    data: {
      name: "No Role Manager",
      email: `no-role-manager-${suffix}@example.com`,
      passwordHash: hashPassword(password),
      role: "MANAGER",
      region: "Gandhi Nagar"
    }
  });
  userIds.push(admin.id, noRoleManager.id);

  const adminContext = await openStaffSession(browser, baseURL, admin);
  const adminPage = await adminContext.newPage();

  try {
    const roleResponse = await adminPage.request.post("/api/app/roles", {
      data: {
        name: `Booking Only ${suffix}`,
        description: "Bookings only",
        permissions: ["bookings.view"]
      }
    });
    expect(roleResponse.status()).toBe(201);
    const bookingOnlyRole = (await roleResponse.json()).data;

    const managerResponse = await adminPage.request.post("/api/app/managers", {
      data: {
        name: "Booking Only Manager",
        email: `booking-only-manager-${suffix}@example.com`,
        password,
        region: "Gandhi Nagar",
        accessRoleId: bookingOnlyRole.id
      }
    });
    expect(managerResponse.status()).toBe(201);
    const bookingOnlyManager = (await managerResponse.json()).data;
    userIds.push(bookingOnlyManager.id);

    const noRoleContext = await openStaffSession(browser, baseURL, noRoleManager);
    const noRolePage = await noRoleContext.newPage();
    try {
      await expectJsonError(await noRolePage.request.get("/api/app/bookings"), 403);
      await expectJsonError(await noRolePage.request.get("/api/app/dispatch"), 403);
    } finally {
      await noRoleContext.close();
    }

    const managerContext = await openStaffSession(browser, baseURL, bookingOnlyManager);
    const managerPage = await managerContext.newPage();
    try {
      const bookingsResponse = await managerPage.request.get("/api/app/bookings");
      expect(bookingsResponse.status()).toBe(200);
      await expectJsonError(await managerPage.request.get("/api/app/dispatch"), 403);
      await expectJsonError(await managerPage.request.get("/api/app/roles"), 403);
      await expectJsonError(await managerPage.request.get("/api/app/managers"), 403);

      await managerPage.goto("/bookings");
      await expect(managerPage.getByRole("heading", { name: "Bookings" })).toBeVisible();
      await managerPage.goto("/dispatch");
      await expect(managerPage).toHaveURL(/\/$/);
    } finally {
      await managerContext.close();
    }
  } finally {
    await adminContext.close();
    await cleanupAccessRoleFixtures(suffix, userIds);
  }
});

test("old role-named staff routes and APIs are removed", async ({ browser, baseURL }) => {
  const suffix = Date.now();
  const password = `Password-${suffix}!`;
  const admin = await prisma.user.create({
    data: {
      name: "Route Removal Admin",
      email: `route-removal-admin-${suffix}@example.com`,
      passwordHash: hashPassword(password),
      role: "ADMIN"
    }
  });

  const context = await openStaffSession(browser, baseURL, admin);
  const page = await context.newPage();

  try {
    expect((await page.request.get("/admin")).status()).toBe(404);
    expect((await page.request.get("/admin/categories")).status()).toBe(404);
    expect((await page.request.get("/admin/services")).status()).toBe(404);
    expect((await page.request.get("/manager")).status()).toBe(404);
    expect((await page.request.get("/manager/bookings")).status()).toBe(404);
    expect((await page.request.get("/manager/dispatch")).status()).toBe(404);
    expect((await page.request.get("/admin/bookings")).status()).toBe(404);
    expect((await page.request.get("/api/app/manager/bookings")).status()).toBe(404);
    expect((await page.request.get("/api/app/manager/dispatch")).status()).toBe(404);
  } finally {
    await context.close();
    await prisma.user.deleteMany({ where: { id: admin.id } });
  }
});
