"use server";

import { revalidatePath } from "next/cache";

import {
  assignWorkerToBooking,
  updateBookingStatusAsManager
} from "@/features/bookings/booking.service";
import { requireOperationsUser } from "@/features/auth/session.service";
import {
  assertAccessPermission,
  resolveAllowedRegion,
  resolveOperationsAccess
} from "@/features/operations/operations-access";

function revalidateOperationalBookingPaths(bookingId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/bookings");
  revalidatePath("/dispatch");
  if (bookingId) {
    revalidatePath(`/bookings/${bookingId}`);
  }
  revalidatePath("/worker");
  revalidatePath("/account");
}

export async function assignWorker(formData: FormData) {
  const manager = await requireOperationsUser();
  const access = resolveOperationsAccess(manager);
  assertAccessPermission(access, "dispatch.assign");
  const bookingId = String(formData.get("bookingId") ?? "");

  await assignWorkerToBooking({
    bookingId,
    workerId: String(formData.get("workerId") ?? ""),
    managerId: manager.id,
    allowedRegion: resolveAllowedRegion(access)
  });

  revalidateOperationalBookingPaths(bookingId);
}

export async function updateBookingStatus(formData: FormData) {
  const manager = await requireOperationsUser();
  const access = resolveOperationsAccess(manager);
  assertAccessPermission(access, "bookings.statusOverride");
  const bookingId = String(formData.get("bookingId") ?? "");

  await updateBookingStatusAsManager({
    bookingId,
    status: String(formData.get("status") ?? ""),
    managerId: manager.id,
    allowedRegion: resolveAllowedRegion(access)
  });

  revalidateOperationalBookingPaths(bookingId);
}
