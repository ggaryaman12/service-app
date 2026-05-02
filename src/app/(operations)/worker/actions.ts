"use server";

import { revalidatePath } from "next/cache";

import {
  toggleWorkerDuty,
  updateAssignedWorkerJobStatus
} from "@/features/bookings/booking.service";
import { requireWorker } from "@/features/auth/session.service";

export async function toggleDuty() {
  const user = await requireWorker();
  await toggleWorkerDuty(user.id);

  revalidatePath("/worker");
  revalidatePath("/dispatch");
}

export async function updateJobStatus(formData: FormData) {
  const user = await requireWorker();
  const bookingId = String(formData.get("bookingId") ?? "");

  await updateAssignedWorkerJobStatus({
    bookingId,
    workerId: user.id,
    status: String(formData.get("status") ?? "")
  });

  revalidatePath("/worker");
  revalidatePath(`/worker/job/${bookingId}`);
  revalidatePath("/bookings");
  revalidatePath("/account");
}
