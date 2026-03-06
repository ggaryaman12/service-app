"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function requireNonEmpty(value: FormDataEntryValue | null, field: string) {
  const str = String(value ?? "").trim();
  if (!str) throw new Error(`${field} is required`);
  return str;
}

export async function createBooking(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    const serviceId = String(formData.get("serviceId") ?? "");
    redirect(`/customer/login?next=${encodeURIComponent(`/book/${serviceId}`)}`);
  }

  const serviceId = requireNonEmpty(formData.get("serviceId"), "Service");
  const address = requireNonEmpty(formData.get("address"), "Address");
  const region = String(formData.get("region") ?? "").trim() || null;
  const scheduledDateStr = requireNonEmpty(formData.get("scheduledDate"), "Date");
  const scheduledTimeSlot = requireNonEmpty(formData.get("scheduledTimeSlot"), "Time slot");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const customer = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });
  if (!customer) throw new Error("User not found");

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { basePrice: true }
  });
  if (!service) throw new Error("Service not found");

  const scheduledDate = new Date(`${scheduledDateStr}T00:00:00.000Z`);

  await prisma.user.update({
    where: { id: customer.id },
    data: { region }
  });

  const booking = await prisma.booking.create({
    data: {
      customerId: customer.id,
      serviceId,
      status: "PENDING",
      scheduledDate,
      scheduledTimeSlot,
      address,
      totalAmount: service.basePrice,
      notes
    }
  });

  revalidatePath("/manager/dispatch");
  revalidatePath("/manager/bookings");
  revalidatePath("/account");
  redirect(`/account?new=${encodeURIComponent(booking.id)}`);
}
