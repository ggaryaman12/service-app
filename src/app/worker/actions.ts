"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

function requireNonEmpty(value: FormDataEntryValue | null, field: string) {
  const str = String(value ?? "").trim();
  if (!str) throw new Error(`${field} is required`);
  return str;
}

async function requireWorker() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || (role !== "WORKER" && role !== "ADMIN")) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true, role: true }
  });
  if (!user) throw new Error("User not found");
  if (user.role !== "WORKER" && user.role !== "ADMIN") throw new Error("Unauthorized");
  return user.id;
}

export async function toggleDuty() {
  const userId = await requireWorker();

  const existing = await prisma.workerProfile.findUnique({ where: { userId } });
  await prisma.workerProfile.upsert({
    where: { userId },
    update: { isOnline: !(existing?.isOnline ?? false) },
    create: { userId, skills: [], isOnline: true }
  });

  revalidatePath("/worker");
  revalidatePath("/manager/dispatch");
}

export async function updateJobStatus(formData: FormData) {
  const userId = await requireWorker();
  const bookingId = requireNonEmpty(formData.get("bookingId"), "Booking ID");
  const status = requireNonEmpty(formData.get("status"), "Status") as BookingStatus;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { workerId: true }
  });
  if (!booking || booking.workerId !== userId) throw new Error("Not assigned to you");

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status }
  });

  revalidatePath("/worker");
  revalidatePath(`/worker/job/${bookingId}`);
  revalidatePath("/manager/bookings");
  revalidatePath("/account");
}
