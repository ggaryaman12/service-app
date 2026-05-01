"use server";

import { revalidatePath } from "next/cache";

import {
  assignWorkerToBooking,
  updateBookingStatusAsManager
} from "@/features/bookings/booking.service";
import { requireManager } from "@/features/auth/session.service";

export async function assignWorker(formData: FormData) {
  const manager = await requireManager();
  await assignWorkerToBooking({
    bookingId: String(formData.get("bookingId") ?? ""),
    workerId: String(formData.get("workerId") ?? ""),
    managerId: manager.id
  });

  revalidatePath("/manager/dispatch");
  revalidatePath("/manager/bookings");
  revalidatePath("/worker");
  revalidatePath("/account");
}

export async function updateBookingStatus(formData: FormData) {
  const manager = await requireManager();
  const bookingId = String(formData.get("bookingId") ?? "");

  await updateBookingStatusAsManager({
    bookingId,
    status: String(formData.get("status") ?? ""),
    managerId: manager.id
  });

  revalidatePath("/manager/bookings");
  revalidatePath(`/manager/bookings/${bookingId}`);
  revalidatePath("/worker");
  revalidatePath("/account");
}
