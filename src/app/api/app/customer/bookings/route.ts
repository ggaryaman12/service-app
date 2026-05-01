import { createBooking, getCustomerBookings } from "@/features/bookings/booking.service";
import { requireCustomer } from "@/features/auth/session.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

type CreateBookingRequest = {
  serviceId?: string;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  address?: string;
  region?: string | null;
  notes?: string | null;
};

export async function GET() {
  try {
    const user = await requireCustomer();
    return jsonOk(await getCustomerBookings(user.id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireCustomer();
    const body = await readJson<CreateBookingRequest>(request);
    const booking = await createBooking({
      customerId: user.id,
      serviceId: body?.serviceId ?? "",
      scheduledDate: body?.scheduledDate ?? "",
      scheduledTimeSlot: body?.scheduledTimeSlot ?? "",
      address: body?.address ?? "",
      region: body?.region ?? null,
      notes: body?.notes ?? null
    });

    return jsonOk(booking, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
