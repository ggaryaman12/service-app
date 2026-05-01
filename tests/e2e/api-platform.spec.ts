import {
  expect,
  test,
  type APIRequestContext,
  type APIResponse,
  type Browser,
  type Page
} from "@playwright/test";
import nextEnv from "@next/env";
import { encode } from "next-auth/jwt";

import { createIntegrationChannel } from "../../src/features/integrations/integration-channel.service";
import { updateAssignedWorkerJobStatus } from "../../src/features/bookings/booking.service";
import { columnExists, tableExists } from "../../src/lib/db-meta";
import { hashPassword } from "../../src/lib/password";
import { prisma } from "../../src/lib/prisma";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

type ApiRoute = {
  method: "get" | "patch" | "post";
  path: string;
  data?: Record<string, unknown>;
};

async function requestApi(request: APIRequestContext, route: ApiRoute) {
  if (route.method === "get") return request.get(route.path);
  if (route.method === "patch") return request.patch(route.path, { data: route.data ?? {} });
  return request.post(route.path, { data: route.data ?? {} });
}

async function expectJsonError(
  response: APIResponse,
  status: number,
  code: string,
  message: string
) {
  expect(response.status()).toBe(status);
  expect(await response.json()).toEqual({
    error: { code, message }
  });
}

async function createRoleTestUser(
  role: "ADMIN" | "MANAGER" | "WORKER" | "CUSTOMER",
  suffix: number,
  password: string
) {
  return prisma.user.create({
    data: {
      name: `${role} API Role Test`,
      email: `${role.toLowerCase()}-api-role-${suffix}@example.com`,
      phone: role === "CUSTOMER" ? "9999999999" : null,
      passwordHash: hashPassword(password),
      role
    }
  });
}

async function loginWithPage(
  browser: Browser,
  baseURL: string | undefined,
  user: { id: string; name: string; email: string; role: string }
) {
  const url = baseURL ?? "http://127.0.0.1:3100";
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is required for session tests");
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
      url,
      httpOnly: true,
      sameSite: "Lax"
    }
  ]);
  const page = await context.newPage();
  return { page, close: () => context.close() };
}

async function expectForbidden(page: Page, path: string) {
  const response = await page.request.get(path);
  await expectJsonError(response, 403, "FORBIDDEN", "Forbidden");
}

function skipMissingMigration(condition: boolean, message: string) {
  if (!condition && process.env.CI) {
    throw new Error(`${message}. Apply Prisma migrations before running API platform tests.`);
  }
  test.skip(!condition, message);
}

test("open catalog works without authentication", async ({ request }) => {
  const response = await request.get("/api/open/catalog");

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(Array.isArray(body.data.categories)).toBe(true);
  expect(Array.isArray(body.data.services)).toBe(true);
});

test("open booking APIs require a channel API key", async ({ request }) => {
  const createResponse = await request.post("/api/open/bookings", {
    data: {
      customer: {
        name: "API Test Customer",
        email: "api-test-customer@example.com",
        phone: "9999999999"
      },
      serviceId: "missing-service",
      scheduledDate: "2026-05-02",
      scheduledTimeSlot: "09:00 - 11:00",
      address: "Test address"
    }
  });

  await expectJsonError(createResponse, 401, "MISSING_API_KEY", "Missing API key");

  const statusResponse = await request.get("/api/open/bookings/missing/status");
  await expectJsonError(statusResponse, 401, "MISSING_API_KEY", "Missing API key");
});

test("open booking APIs reject invalid channel API keys", async ({ request }) => {
  skipMissingMigration(
    await tableExists("IntegrationChannel"),
    "IntegrationChannel migration has not been applied"
  );

  const createResponse = await request.post("/api/open/bookings", {
    headers: { "x-api-key": "js_invalid_e2e_key" },
    data: {
      customer: {
        name: "API Test Customer",
        email: "api-test-customer@example.com",
        phone: "9999999999"
      },
      serviceId: "missing-service",
      scheduledDate: "2026-05-02",
      scheduledTimeSlot: "09:00 - 11:00",
      address: "Test address"
    }
  });

  await expectJsonError(createResponse, 401, "INVALID_API_KEY", "Invalid API key");

  const statusResponse = await request.get("/api/open/bookings/missing/status", {
    headers: { "x-api-key": "js_invalid_e2e_key" }
  });
  await expectJsonError(statusResponse, 401, "INVALID_API_KEY", "Invalid API key");
});

const unauthenticatedFirstPartyRoutes: ApiRoute[] = [
  { method: "get", path: "/api/app/customer/account" },
  { method: "get", path: "/api/app/customer/bookings" },
  { method: "get", path: "/api/app/admin/catalog" },
  { method: "get", path: "/api/app/manager/bookings" },
  { method: "get", path: "/api/app/worker/jobs" }
];

for (const route of unauthenticatedFirstPartyRoutes) {
  test(`first-party ${route.method.toUpperCase()} ${route.path} requires an authenticated app session`, async ({
    request
  }) => {
    const response = await requestApi(request, route);

    await expectJsonError(response, 401, "UNAUTHENTICATED", "Authentication required");
  });
}

test("first-party app APIs reject authenticated users with the wrong role", async ({
  browser,
  baseURL
}) => {
  const suffix = Date.now();
  const password = `Password-${suffix}!`;
  const createdUserIds: string[] = [];

  try {
    const [customer, manager] = await Promise.all([
      createRoleTestUser("CUSTOMER", suffix, password),
      createRoleTestUser("MANAGER", suffix, password)
    ]);
    createdUserIds.push(customer.id, manager.id);

    const customerSession = await loginWithPage(
      browser,
      baseURL,
      customer
    );
    try {
      await expectForbidden(customerSession.page, "/api/app/admin/catalog");
      await expectForbidden(customerSession.page, "/api/app/manager/bookings");
    } finally {
      await customerSession.close();
    }

    const managerSession = await loginWithPage(
      browser,
      baseURL,
      manager
    );
    try {
      await expectForbidden(managerSession.page, "/api/app/customer/account");
      await expectForbidden(managerSession.page, "/api/app/worker/jobs");
    } finally {
      await managerSession.close();
    }
  } finally {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  }
});

test("open booking creates a pending booking and exposes minimal status", async ({ request }) => {
  skipMissingMigration(
    await tableExists("IntegrationChannel"),
    "IntegrationChannel migration has not been applied"
  );

  const suffix = Date.now();
  const email = `open-booking-${suffix}@example.com`;
  let categoryId: string | null = null;
  let serviceId: string | null = null;
  let channelId: string | null = null;
  let unrelatedChannelId: string | null = null;
  let bookingId: string | null = null;

  try {
    const channelResult = await createIntegrationChannel({
      name: `test-channel-${suffix}`,
      scopes: ["booking:create", "booking:status"]
    });
    channelId = channelResult.channel.id;
    const unrelatedChannelResult = await createIntegrationChannel({
      name: `test-status-channel-${suffix}`,
      scopes: ["booking:status"]
    });
    unrelatedChannelId = unrelatedChannelResult.channel.id;

    const category = await prisma.category.create({
      data: {
        name: `API Test Category ${suffix}`,
        slug: `api-test-category-${suffix}`,
        active: true
      }
    });
    categoryId = category.id;

    const service = await prisma.service.create({
      data: {
        categoryId: category.id,
        name: `API Test Service ${suffix}`,
        description: "Created by API platform e2e test",
        basePrice: 499,
        estimatedMinutes: 30
      }
    });
    serviceId = service.id;

    const createResponse = await request.post("/api/open/bookings", {
      headers: { "x-api-key": channelResult.apiKey },
      data: {
        customer: {
          name: "Open Booking Customer",
          email,
          phone: "9999999999"
        },
        serviceId: service.id,
        scheduledDate: "2026-05-02",
        scheduledTimeSlot: "09:00 - 11:00",
        address: "Open API test address"
      }
    });

    expect(createResponse.status()).toBe(201);
    const createBody = await createResponse.json();
    bookingId = createBody.data.id;
    expect(createBody.data.status).toBe("PENDING");

    const statusResponse = await request.get(`/api/open/bookings/${bookingId}/status`, {
      headers: { "x-api-key": channelResult.apiKey }
    });

    expect(statusResponse.status()).toBe(200);
    const statusBody = await statusResponse.json();
    expect(statusBody).toEqual({
      data: {
        id: bookingId,
        status: "PENDING",
        scheduledDate: "2026-05-02",
        scheduledTimeSlot: "09:00 - 11:00",
        service: {
          id: service.id,
          name: service.name
        },
        worker: null
      }
    });

    const unrelatedStatusResponse = await request.get(`/api/open/bookings/${bookingId}/status`, {
      headers: { "x-api-key": unrelatedChannelResult.apiKey }
    });
    await expectJsonError(
      unrelatedStatusResponse,
      404,
      "BOOKING_NOT_FOUND",
      "Booking not found"
    );
  } finally {
    if (bookingId) await prisma.booking.deleteMany({ where: { id: bookingId } });
    await prisma.user.deleteMany({ where: { email } });
    if (serviceId) await prisma.service.deleteMany({ where: { id: serviceId } });
    if (categoryId) await prisma.category.deleteMany({ where: { id: categoryId } });
    if (channelId) await prisma.integrationChannel.deleteMany({ where: { id: channelId } });
    if (unrelatedChannelId) {
      await prisma.integrationChannel.deleteMany({ where: { id: unrelatedChannelId } });
    }
  }
});

test("worker status APIs reject unassigned jobs and invalid transitions", async ({
  browser,
  baseURL
}) => {
  skipMissingMigration(
    await columnExists("Booking", "integrationChannelId"),
    "Integration channel booking column has not been applied"
  );

  const suffix = Date.now();
  const password = `Password-${suffix}!`;
  let categoryId: string | null = null;
  let serviceId: string | null = null;
  let customerId: string | null = null;
  let workerId: string | null = null;
  let otherWorkerId: string | null = null;
  let bookingId: string | null = null;

  try {
    const [customer, worker, otherWorker] = await Promise.all([
      prisma.user.create({
        data: {
          name: "Transition Customer",
          email: `transition-customer-${suffix}@example.com`,
          passwordHash: "locked:test",
          role: "CUSTOMER"
        }
      }),
      prisma.user.create({
        data: {
          name: "Transition Worker",
          email: `transition-worker-${suffix}@example.com`,
          passwordHash: hashPassword(password),
          role: "WORKER"
        }
      }),
      prisma.user.create({
        data: {
          name: "Other Transition Worker",
          email: `transition-worker-other-${suffix}@example.com`,
          passwordHash: hashPassword(password),
          role: "WORKER"
        }
      })
    ]);
    customerId = customer.id;
    workerId = worker.id;
    otherWorkerId = otherWorker.id;

    const category = await prisma.category.create({
      data: {
        name: `Transition Category ${suffix}`,
        slug: `transition-category-${suffix}`,
        active: true
      }
    });
    categoryId = category.id;

    const service = await prisma.service.create({
      data: {
        categoryId: category.id,
        name: `Transition Service ${suffix}`,
        description: "Created by transition e2e test",
        basePrice: 499,
        estimatedMinutes: 30
      }
    });
    serviceId = service.id;

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        workerId: worker.id,
        serviceId: service.id,
        status: "CONFIRMED",
        scheduledDate: new Date("2026-05-02T00:00:00.000Z"),
        scheduledTimeSlot: "09:00 - 11:00",
        address: "Transition test address",
        totalAmount: 499
      }
    });
    bookingId = booking.id;

    const otherWorkerSession = await loginWithPage(
      browser,
      baseURL,
      otherWorker
    );
    try {
      const response = await otherWorkerSession.page.request.patch("/api/app/worker/jobs", {
        data: {
          bookingId: booking.id,
          status: "EN_ROUTE"
        }
      });
      await expectJsonError(response, 403, "NOT_ASSIGNED", "Not assigned to you");
    } finally {
      await otherWorkerSession.close();
    }

    await expect(
      updateAssignedWorkerJobStatus({
        bookingId: booking.id,
        workerId: otherWorker.id,
        status: "EN_ROUTE"
      })
    ).rejects.toThrow("Not assigned to you");

    await expect(
      updateAssignedWorkerJobStatus({
        bookingId: booking.id,
        workerId: worker.id,
        status: "COMPLETED"
      })
    ).rejects.toThrow("Cannot move booking from CONFIRMED to COMPLETED");
  } finally {
    if (bookingId) await prisma.booking.deleteMany({ where: { id: bookingId } });
    if (serviceId) await prisma.service.deleteMany({ where: { id: serviceId } });
    if (categoryId) await prisma.category.deleteMany({ where: { id: categoryId } });
    await prisma.user.deleteMany({
      where: { id: { in: [customerId, workerId, otherWorkerId].filter(Boolean) as string[] } }
    });
  }
});
