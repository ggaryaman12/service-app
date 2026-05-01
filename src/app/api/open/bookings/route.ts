import { authenticateIntegrationChannel } from "@/features/integrations/integration-channel.service";
import { createOpenBooking } from "@/features/bookings/booking.service";
import { jsonError, jsonOk, readJson } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

type OpenBookingRequest = {
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  serviceId?: string;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  address?: string;
  region?: string | null;
  notes?: string | null;
};

export async function POST(request: Request) {
  try {
    const channel = await authenticateIntegrationChannel(
      request.headers.get("x-api-key"),
      "booking:create"
    );
    const body = await readJson<OpenBookingRequest>(request);
    const booking = await createOpenBooking({
      customer: {
        name: body?.customer?.name ?? "",
        email: body?.customer?.email ?? "",
        phone: body?.customer?.phone ?? ""
      },
      serviceId: body?.serviceId ?? "",
      scheduledDate: body?.scheduledDate ?? "",
      scheduledTimeSlot: body?.scheduledTimeSlot ?? "",
      address: body?.address ?? "",
      region: body?.region ?? null,
      notes: body?.notes ?? null,
      integrationChannelId: channel.id
    });

    return jsonOk(
      {
        id: booking.id,
        status: booking.status
      },
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
