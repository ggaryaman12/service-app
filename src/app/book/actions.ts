"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createBooking as createBookingService } from "@/features/bookings/booking.service";
import { requireCustomer } from "@/features/auth/session.service";
import { AppError } from "@/features/shared/errors";

export async function createBooking(formData: FormData) {
  const serviceId = String(formData.get("serviceId") ?? "");
  let customer;
  try {
    customer = await requireCustomer();
  } catch (error) {
    if (error instanceof AppError && error.status === 401) {
      redirect(`/customer/login?next=${encodeURIComponent(`/book/${serviceId}`)}`);
    }
    throw error;
  }

  const booking = await createBookingService({
    customerId: customer.id,
    serviceId,
    address: String(formData.get("address") ?? ""),
    region: String(formData.get("region") ?? "").trim() || null,
    scheduledDate: String(formData.get("scheduledDate") ?? ""),
    scheduledTimeSlot: String(formData.get("scheduledTimeSlot") ?? ""),
    notes: String(formData.get("notes") ?? "").trim() || null
  });

  revalidatePath("/manager/dispatch");
  revalidatePath("/manager/bookings");
  revalidatePath("/account");
  redirect(`/account?new=${encodeURIComponent(booking.id)}`);
}
