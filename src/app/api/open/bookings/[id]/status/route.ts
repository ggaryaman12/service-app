import { authenticateIntegrationChannel } from "@/features/integrations/integration-channel.service";
import { getOpenBookingStatus } from "@/features/bookings/booking.service";
import { jsonError, jsonOk } from "@/app/api/_lib/respond";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const channel = await authenticateIntegrationChannel(
      request.headers.get("x-api-key"),
      "booking:status"
    );
    const { id } = await params;
    return jsonOk(await getOpenBookingStatus(id, channel.id));
  } catch (error) {
    return jsonError(error);
  }
}
