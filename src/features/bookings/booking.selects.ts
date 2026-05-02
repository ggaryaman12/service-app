import type { Prisma } from "@prisma/client";

export const managerBookingSelect = {
  id: true,
  status: true,
  scheduledDate: true,
  scheduledTimeSlot: true,
  totalAmount: true,
  customer: { select: { name: true, email: true, region: true } },
  worker: { select: { name: true } },
  service: { select: { name: true, category: { select: { name: true } } } }
} satisfies Prisma.BookingSelect;

export const dispatchBookingSelect = {
  id: true,
  scheduledDate: true,
  scheduledTimeSlot: true,
  totalAmount: true,
  address: true,
  customer: { select: { name: true, region: true } },
  service: { select: { name: true, category: { select: { name: true } } } }
} satisfies Prisma.BookingSelect;

export const bookingDetailSelect = {
  id: true,
  status: true,
  scheduledDate: true,
  scheduledTimeSlot: true,
  totalAmount: true,
  address: true,
  workerId: true,
  customer: { select: { name: true, email: true, region: true } },
  service: { select: { name: true, category: { select: { name: true } } } }
} satisfies Prisma.BookingSelect;
