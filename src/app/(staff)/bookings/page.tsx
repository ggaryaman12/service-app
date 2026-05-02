import { redirect } from "next/navigation";

import { requireStaffFeatureUser } from "@/features/auth/session.service";
import {
  hasAccessPermission,
  resolveOperationsAccess
} from "@/features/operations/operations-access";
import { BookingListWorkspace } from "@/app/(operations)/_components/bookings/booking-workspaces";

export default async function BookingsPage({
  searchParams
}: {
  searchParams?: Promise<{ region?: string }>;
}) {
  const viewer = await requireStaffFeatureUser();
  const access = resolveOperationsAccess(viewer);
  if (!hasAccessPermission(access, "bookings.view")) redirect("/");
  const { region } = (await searchParams) ?? {};

  return <BookingListWorkspace viewer={viewer} requestedRegion={region} />;
}
