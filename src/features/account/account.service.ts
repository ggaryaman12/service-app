import { prisma } from "@/lib/prisma";
import { getCustomerBookings } from "@/features/bookings/booking.service";
import { AppError } from "@/features/shared/errors";

export async function getCustomerAccount(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, region: true, phone: true }
  });

  if (!user || user.role !== "CUSTOMER") {
    throw new AppError("CUSTOMER_NOT_FOUND", "Customer not found", 404);
  }

  const bookings = await getCustomerBookings(user.id);
  return { user, bookings };
}

export async function getCustomerAccountByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true, region: true, phone: true }
  });

  if (!user || user.role !== "CUSTOMER") {
    throw new AppError("CUSTOMER_NOT_FOUND", "Customer not found", 404);
  }

  const bookings = await getCustomerBookings(user.id);
  return { user, bookings };
}
