"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createCartBookings,
  parseCartPayload
} from "@/features/bookings/booking.service";
import { requireCustomer } from "@/features/auth/session.service";
import { AppError, assertNonEmpty } from "@/features/shared/errors";

export async function createBookingsFromCart(formData: FormData) {
  let customer;
  try {
    customer = await requireCustomer();
  } catch (error) {
    if (error instanceof AppError && error.status === 401) {
      redirect(`/customer/login?next=${encodeURIComponent("/checkout")}`);
    }
    throw error;
  }

  const bookings = await createCartBookings({
    customerId: customer.id,
    items: parseCartPayload(assertNonEmpty(formData.get("cartPayload"), "Cart")),
    address: String(formData.get("address") ?? ""),
    region: String(formData.get("region") ?? "").trim() || null,
    scheduledDate: String(formData.get("scheduledDate") ?? ""),
    scheduledTimeSlot: String(formData.get("scheduledTimeSlot") ?? ""),
    notes: String(formData.get("notes") ?? "").trim() || null
  });

  revalidatePath("/dispatch");
  revalidatePath("/bookings");
  revalidatePath("/account");
  redirect(`/account?new=${encodeURIComponent(bookings[0]?.id ?? "")}`);
}
