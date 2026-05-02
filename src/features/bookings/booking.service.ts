import { randomBytes } from "node:crypto";
import { BookingStatus, type Prisma, Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { columnExists } from "@/lib/db-meta";
import { AppError, assertNonEmpty } from "@/features/shared/errors";
import {
  bookingDetailSelect,
  dispatchBookingSelect,
  managerBookingSelect
} from "@/features/bookings/booking.selects";

const WORKER_FORWARD_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus>> = {
  CONFIRMED: "EN_ROUTE",
  EN_ROUTE: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED"
};

const MANAGER_STATUSES = new Set<BookingStatus>([
  "PENDING",
  "CONFIRMED",
  "EN_ROUTE",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED"
]);

const bookingMutationSelect = {
  id: true,
  status: true,
  scheduledDate: true,
  scheduledTimeSlot: true,
  address: true,
  totalAmount: true,
  notes: true,
  customerId: true,
  serviceId: true,
  workerId: true,
  managerId: true
} satisfies Prisma.BookingSelect;

const customerBookingSelect = {
  id: true,
  status: true,
  scheduledDate: true,
  scheduledTimeSlot: true,
  totalAmount: true,
  service: { select: { name: true, category: { select: { name: true } } } },
  worker: { select: { name: true, phone: true } }
} satisfies Prisma.BookingSelect;

const workerJobSelect = {
  id: true,
  status: true,
  scheduledTimeSlot: true,
  address: true,
  customer: { select: { name: true } },
  service: { select: { name: true, category: { select: { name: true } } } }
} satisfies Prisma.BookingSelect;

export type BookingCreateInput = {
  customerId: string;
  serviceId: string;
  address: string;
  region?: string | null;
  scheduledDate: string;
  scheduledTimeSlot: string;
  notes?: string | null;
  integrationChannelId?: string | null;
};

export type CartBookingCreateInput = Omit<BookingCreateInput, "serviceId"> & {
  items: Array<{ serviceId: string; quantity: number }>;
};

export type OpenBookingCreateInput = Omit<BookingCreateInput, "customerId"> & {
  customer: {
    name: string;
    email: string;
    phone: string;
  };
};

function normalizeEmail(value: unknown) {
  return assertNonEmpty(value, "Email").toLowerCase();
}

function normalizePhone(value: unknown) {
  return assertNonEmpty(value, "Phone").replace(/\D/g, "");
}

function parseScheduledDate(value: unknown) {
  const raw = assertNonEmpty(value, "Date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new AppError("VALIDATION_ERROR", "Date must use YYYY-MM-DD", 400);
  }
  const date = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new AppError("VALIDATION_ERROR", "Invalid scheduled date", 400);
  }
  return date;
}

function parseStatus(value: unknown) {
  const status = assertNonEmpty(value, "Status") as BookingStatus;
  if (!MANAGER_STATUSES.has(status)) {
    throw new AppError("VALIDATION_ERROR", "Invalid booking status", 400);
  }
  return status;
}

function lockedPasswordHash() {
  return `locked:${randomBytes(32).toString("hex")}`;
}

function normalizeCartItems(items: Array<{ serviceId: string; quantity: number }>) {
  return items
    .map((item) => ({
      serviceId: String(item.serviceId ?? "").trim(),
      quantity: Math.max(1, Math.floor(Number(item.quantity ?? 1)))
    }))
    .filter((item) => item.serviceId);
}

export async function getCustomerByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
    select: { id: true, role: true, phone: true }
  });
}

export async function resolveExternalCustomer(input: {
  name: string;
  email: string;
  phone: string;
  region?: string | null;
}) {
  const name = assertNonEmpty(input.name, "Customer name");
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const region = input.region ? String(input.region).trim() || null : null;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, phone: true }
  });

  if (existing) {
    if (existing.role !== Role.CUSTOMER) {
      throw new AppError(
        "CUSTOMER_ROLE_MISMATCH",
        "Email belongs to a non-customer account",
        409
      );
    }

    const existingPhone = existing.phone ? normalizePhone(existing.phone) : "";
    if (existingPhone && existingPhone !== phone) {
      throw new AppError(
        "CUSTOMER_CONTACT_MISMATCH",
        "Customer phone does not match this email",
        409
      );
    }

    if (!existingPhone || region) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          phone: existingPhone ? undefined : phone,
          region: region ?? undefined
        }
      });
    }

    return existing.id;
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      region,
      role: Role.CUSTOMER,
      passwordHash: lockedPasswordHash()
    },
    select: { id: true }
  });

  return user.id;
}

export async function createBooking(input: BookingCreateInput) {
  const customerId = assertNonEmpty(input.customerId, "Customer");
  const serviceId = assertNonEmpty(input.serviceId, "Service");
  const address = assertNonEmpty(input.address, "Address");
  const scheduledDate = parseScheduledDate(input.scheduledDate);
  const scheduledTimeSlot = assertNonEmpty(input.scheduledTimeSlot, "Time slot");
  const region = input.region ? String(input.region).trim() || null : null;
  const notes = input.notes ? String(input.notes).trim() || null : null;
  const hasIntegrationChannelId = await columnExists("Booking", "integrationChannelId");

  if (input.integrationChannelId && !hasIntegrationChannelId) {
    throw new AppError(
      "MIGRATION_REQUIRED",
      "Booking integration channel column is not available",
      500
    );
  }

  return prisma.$transaction(async (tx) => {
    const customer = await tx.user.findUnique({
      where: { id: customerId },
      select: { id: true, role: true }
    });
    if (!customer || customer.role !== Role.CUSTOMER) {
      throw new AppError("CUSTOMER_REQUIRED", "Customer account is required", 403);
    }

    const service = await tx.service.findUnique({
      where: { id: serviceId },
      select: { id: true, basePrice: true }
    });
    if (!service) throw new AppError("SERVICE_NOT_FOUND", "Service not found", 404);

    if (region !== null) {
      await tx.user.update({
        where: { id: customerId },
        data: { region }
      });
    }

    return tx.booking.create({
      data: {
        customerId,
        serviceId,
        ...(hasIntegrationChannelId
          ? { integrationChannelId: input.integrationChannelId ?? null }
          : {}),
        status: "PENDING",
        scheduledDate,
        scheduledTimeSlot,
        address,
        totalAmount: service.basePrice,
        notes
      },
      select: bookingMutationSelect
    });
  });
}

export async function createOpenBooking(input: OpenBookingCreateInput) {
  const customerId = await resolveExternalCustomer({
    ...input.customer,
    region: input.region
  });

  return createBooking({
    ...input,
    customerId
  });
}

export async function createCartBookings(input: CartBookingCreateInput) {
  const customerId = assertNonEmpty(input.customerId, "Customer");
  const address = assertNonEmpty(input.address, "Address");
  const scheduledDate = parseScheduledDate(input.scheduledDate);
  const scheduledTimeSlot = assertNonEmpty(input.scheduledTimeSlot, "Time slot");
  const region = input.region ? String(input.region).trim() || null : null;
  const notes = input.notes ? String(input.notes).trim() || null : null;
  const items = normalizeCartItems(input.items);
  if (items.length === 0) throw new AppError("CART_EMPTY", "Cart is empty", 400);

  return prisma.$transaction(async (tx) => {
    const customer = await tx.user.findUnique({
      where: { id: customerId },
      select: { id: true, role: true }
    });
    if (!customer || customer.role !== Role.CUSTOMER) {
      throw new AppError("CUSTOMER_REQUIRED", "Customer account is required", 403);
    }

    const services = await tx.service.findMany({
      where: { id: { in: Array.from(new Set(items.map((item) => item.serviceId))) } },
      select: { id: true, basePrice: true }
    });
    const priceById = new Map(services.map((service) => [service.id, service.basePrice]));

    if (region !== null) {
      await tx.user.update({
        where: { id: customerId },
        data: { region }
      });
    }

    const created = [];
    for (const item of items) {
      const basePrice = priceById.get(item.serviceId);
      if (basePrice == null) continue;

      for (let n = 0; n < item.quantity; n++) {
        created.push(
          await tx.booking.create({
            data: {
              customerId,
              serviceId: item.serviceId,
              status: "PENDING",
              scheduledDate,
              scheduledTimeSlot,
              address,
              totalAmount: basePrice,
              notes
            },
            select: bookingMutationSelect
          })
        );
      }
    }

    if (created.length === 0) {
      throw new AppError("SERVICE_NOT_FOUND", "No cart services were found", 404);
    }

    return created;
  });
}

export async function assignWorkerToBooking(input: {
  bookingId: string;
  workerId: string;
  managerId?: string | null;
  allowedRegion?: string | null;
}) {
  const bookingId = assertNonEmpty(input.bookingId, "Booking ID");
  const workerId = assertNonEmpty(input.workerId, "Worker");

  const worker = await prisma.user.findUnique({
    where: { id: workerId },
    select: { id: true, role: true, region: true }
  });
  if (!worker || worker.role !== Role.WORKER) {
    throw new AppError("WORKER_NOT_FOUND", "Worker not found", 404);
  }
  if (input.allowedRegion && worker.region !== input.allowedRegion) {
    throw new AppError("FORBIDDEN", "Forbidden", 403);
  }

  if (input.allowedRegion) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { customer: { select: { region: true } } }
    });
    if (!booking || booking.customer.region !== input.allowedRegion) {
      throw new AppError("FORBIDDEN", "Forbidden", 403);
    }
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      workerId,
      managerId: input.managerId ?? undefined,
      status: "CONFIRMED"
    },
    select: bookingMutationSelect
  });
}

export async function updateBookingStatusAsManager(input: {
  bookingId: string;
  status: string;
  managerId?: string | null;
  allowedRegion?: string | null;
}) {
  const bookingId = assertNonEmpty(input.bookingId, "Booking ID");
  const status = parseStatus(input.status);

  if (input.allowedRegion) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { customer: { select: { region: true } } }
    });
    if (!booking || booking.customer.region !== input.allowedRegion) {
      throw new AppError("FORBIDDEN", "Forbidden", 403);
    }
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status,
      managerId: input.managerId ?? undefined
    },
    select: bookingMutationSelect
  });
}

export async function updateAssignedWorkerJobStatus(input: {
  bookingId: string;
  workerId: string;
  status: string;
}) {
  const bookingId = assertNonEmpty(input.bookingId, "Booking ID");
  const workerId = assertNonEmpty(input.workerId, "Worker");
  const status = parseStatus(input.status);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { workerId: true, status: true }
  });
  if (!booking || booking.workerId !== workerId) {
    throw new AppError("NOT_ASSIGNED", "Not assigned to you", 403);
  }

  const allowedNext = WORKER_FORWARD_TRANSITIONS[booking.status];
  if (allowedNext !== status) {
    throw new AppError(
      "INVALID_STATUS_TRANSITION",
      `Cannot move booking from ${booking.status} to ${status}`,
      400
    );
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    select: bookingMutationSelect
  });
}

export async function toggleWorkerDuty(userId: string) {
  const id = assertNonEmpty(userId, "Worker");
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true }
  });
  if (!user || (user.role !== Role.WORKER && user.role !== Role.ADMIN)) {
    throw new AppError("UNAUTHORIZED", "Worker account is required", 403);
  }

  const existing = await prisma.workerProfile.findUnique({ where: { userId: id } });
  return prisma.workerProfile.upsert({
    where: { userId: id },
    update: { isOnline: !(existing?.isOnline ?? false) },
    create: { userId: id, skills: [], isOnline: true }
  });
}

export async function getCustomerBookings(customerId: string) {
  return prisma.booking.findMany({
    where: { customerId },
    select: customerBookingSelect,
    orderBy: [{ scheduledDate: "desc" }],
    take: 50
  });
}

export async function getOpenBookingStatus(bookingId: string, integrationChannelId: string) {
  const id = assertNonEmpty(bookingId, "Booking ID");
  const channelId = assertNonEmpty(integrationChannelId, "Integration channel");
  const hasIntegrationChannelId = await columnExists("Booking", "integrationChannelId");
  if (!hasIntegrationChannelId) {
    throw new AppError(
      "MIGRATION_REQUIRED",
      "Booking integration channel column is not available",
      500
    );
  }

  const booking = await prisma.booking.findFirst({
    where: { id, integrationChannelId: channelId },
    select: {
      id: true,
      status: true,
      scheduledDate: true,
      scheduledTimeSlot: true,
      service: { select: { id: true, name: true } },
      worker: { select: { name: true } }
    }
  });

  if (!booking) throw new AppError("BOOKING_NOT_FOUND", "Booking not found", 404);

  return {
    id: booking.id,
    status: booking.status,
    scheduledDate: booking.scheduledDate.toISOString().slice(0, 10),
    scheduledTimeSlot: booking.scheduledTimeSlot,
    service: booking.service,
    worker: booking.worker ? { name: booking.worker.name } : null
  };
}

export async function getManagerBookings(region?: string | null) {
  return prisma.booking.findMany({
    where: region ? { customer: { region } } : undefined,
    select: managerBookingSelect,
    orderBy: [{ scheduledDate: "desc" }],
    take: 50
  });
}

export async function getManagerBooking(bookingId: string) {
  const id = assertNonEmpty(bookingId, "Booking ID");

  return prisma.booking.findUnique({
    where: { id },
    select: bookingDetailSelect
  });
}

export async function getDispatchSnapshot(region?: string | null) {
  return Promise.all([
    prisma.booking.findMany({
      where: {
        status: "PENDING",
        ...(region ? { customer: { region } } : {})
      },
      select: dispatchBookingSelect,
      orderBy: [{ scheduledDate: "asc" }],
      take: 25
    }),
    prisma.workerProfile.findMany({
      where: {
        isOnline: true,
        user: { role: "WORKER", ...(region ? { region } : {}) }
      },
      select: {
        userId: true,
        isOnline: true,
        skills: true,
        rating: true,
        totalJobs: true,
        currentLocation: true,
        user: { select: { id: true, name: true, region: true } }
      },
      orderBy: [{ user: { name: "asc" } }]
    })
  ]);
}

type OperationalBookingsArgs = {
  region?: string | null;
};

export async function getOperationalBookings(args: OperationalBookingsArgs = {}) {
  return getManagerBookings(args.region);
}

export async function getOperationalDispatchSnapshot(args: OperationalBookingsArgs = {}) {
  return getDispatchSnapshot(args.region);
}

export async function getWorkerJobs(userId: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  return prisma.booking.findMany({
    where: {
      workerId: userId,
      scheduledDate: { gte: todayStart, lt: tomorrowStart },
      status: { in: ["CONFIRMED", "EN_ROUTE", "IN_PROGRESS"] }
    },
    select: workerJobSelect,
    orderBy: [{ scheduledDate: "asc" }]
  });
}

export function parseCartPayload(raw: string): Array<{ serviceId: string; quantity: number }> {
  try {
    const payload = JSON.parse(raw) as { items?: Array<{ serviceId: string; quantity: number }> };
    return normalizeCartItems(payload.items ?? []);
  } catch {
    throw new AppError("INVALID_CART", "Invalid cart payload", 400);
  }
}

export type BookingWithRelations = Prisma.BookingGetPayload<{
  include: { service: { include: { category: true } }; worker: true; customer: true };
}>;
