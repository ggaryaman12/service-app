import { createCartBookings } from "@/features/bookings/booking.service";
import { requireCustomer } from "@/features/auth/session.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

type CheckoutRequest = {
  items?: Array<{ serviceId?: string; quantity?: number }>;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  address?: string;
  region?: string | null;
  notes?: string | null;
};

export async function POST(request: Request) {
  try {
    const user = await requireCustomer();
    const body = await readJson<CheckoutRequest>(request);
    const bookings = await createCartBookings({
      customerId: user.id,
      items:
        body?.items?.map((item) => ({
          serviceId: item.serviceId ?? "",
          quantity: Number(item.quantity ?? 1)
        })) ?? [],
      scheduledDate: body?.scheduledDate ?? "",
      scheduledTimeSlot: body?.scheduledTimeSlot ?? "",
      address: body?.address ?? "",
      region: body?.region ?? null,
      notes: body?.notes ?? null
    });

    return jsonOk(
      {
        bookingIds: bookings.map((booking) => booking.id)
      },
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
