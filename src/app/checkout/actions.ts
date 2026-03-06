"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type CartPayload = {
  items: Array<{ serviceId: string; quantity: number }>;
};

function requireNonEmpty(value: FormDataEntryValue | null, field: string) {
  const str = String(value ?? "").trim();
  if (!str) throw new Error(`${field} is required`);
  return str;
}

export async function createBookingsFromCart(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect(`/customer/login?next=${encodeURIComponent("/checkout")}`);
  }
  if (session.user.role !== "CUSTOMER") redirect("/");

  const payloadRaw = requireNonEmpty(formData.get("cartPayload"), "Cart");
  const address = requireNonEmpty(formData.get("address"), "Address");
  const region = String(formData.get("region") ?? "").trim() || null;
  const scheduledDateStr = requireNonEmpty(formData.get("scheduledDate"), "Date");
  const scheduledTimeSlot = requireNonEmpty(formData.get("scheduledTimeSlot"), "Time slot");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  let payload: CartPayload;
  try {
    payload = JSON.parse(payloadRaw) as CartPayload;
  } catch {
    throw new Error("Invalid cart payload");
  }

  const items = (payload.items ?? [])
    .map((i) => ({
      serviceId: String((i as any).serviceId ?? ""),
      quantity: Math.max(1, Math.floor(Number((i as any).quantity ?? 1)))
    }))
    .filter((i) => i.serviceId);

  if (items.length === 0) throw new Error("Cart is empty");

  const customer = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });
  if (!customer) throw new Error("User not found");

  const serviceIds = Array.from(new Set(items.map((i) => i.serviceId)));
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, basePrice: true }
  });
  const priceById = new Map(services.map((s) => [s.id, s.basePrice]));

  const scheduledDate = new Date(`${scheduledDateStr}T00:00:00.000Z`);

  await prisma.user.update({
    where: { id: customer.id },
    data: { region }
  });

  const created = [];
  for (const item of items) {
    const basePrice = priceById.get(item.serviceId);
    if (basePrice == null) continue;

    for (let n = 0; n < item.quantity; n++) {
      const booking = await prisma.booking.create({
        data: {
          customerId: customer.id,
          serviceId: item.serviceId,
          status: "PENDING",
          scheduledDate,
          scheduledTimeSlot,
          address,
          totalAmount: basePrice,
          notes
        }
      });
      created.push(booking.id);
    }
  }

  revalidatePath("/manager/dispatch");
  revalidatePath("/manager/bookings");
  revalidatePath("/account");
  redirect(`/account?new=${encodeURIComponent(created[0] ?? "")}`);
}

