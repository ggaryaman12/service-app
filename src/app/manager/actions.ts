"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { auth } from "@/auth";

function requireNonEmpty(value: FormDataEntryValue | null, field: string) {
  const str = String(value ?? "").trim();
  if (!str) throw new Error(`${field} is required`);
  return str;
}

async function requireManager() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || (role !== "MANAGER" && role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }
}

export async function assignWorker(formData: FormData) {
  await requireManager();
  const bookingId = requireNonEmpty(formData.get("bookingId"), "Booking ID");
  const workerId = requireNonEmpty(formData.get("workerId"), "Worker");

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      workerId,
      status: "CONFIRMED"
    }
  });

  revalidatePath("/manager/dispatch");
  revalidatePath("/manager/bookings");
}

export async function updateBookingStatus(formData: FormData) {
  await requireManager();
  const bookingId = requireNonEmpty(formData.get("bookingId"), "Booking ID");
  const status = requireNonEmpty(formData.get("status"), "Status") as BookingStatus;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status }
  });

  revalidatePath("/manager/bookings");
  revalidatePath(`/manager/bookings/${bookingId}`);
}
