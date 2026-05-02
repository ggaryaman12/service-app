import { redirect } from "next/navigation";

import { requireStaffFeatureUser } from "@/features/auth/session.service";
import {
  hasAccessPermission,
  resolveOperationsAccess
} from "@/features/operations/operations-access";
import { BookingDetailWorkspace } from "@/app/(operations)/_components/bookings/booking-workspaces";

export default async function BookingDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, viewer] = await Promise.all([params, requireStaffFeatureUser()]);
  const access = resolveOperationsAccess(viewer);
  if (!hasAccessPermission(access, "bookings.view")) redirect("/");

  return <BookingDetailWorkspace viewer={viewer} bookingId={id} />;
}
