import { redirect } from "next/navigation";

import { signOut } from "@/auth";
import { requireStaffFeatureUser } from "@/features/auth/session.service";
import {
  resolveOperationsAccess,
  serializeAccessPermissions
} from "@/features/operations/operations-access";

import { StaffShell } from "./_components/staff-shell";

export default async function StaffFeatureLayout({ children }: { children: React.ReactNode }) {
  let viewer;
  try {
    viewer = await requireStaffFeatureUser();
  } catch {
    redirect("/staff/login?next=/dashboard");
  }
  const access = resolveOperationsAccess(viewer);

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <StaffShell
      userEmail={viewer.email}
      userName={viewer.name}
      userRole={viewer.role}
      accessRoleName={access.managerAccessRole?.name}
      permissions={serializeAccessPermissions(access.permissions)}
      signOutAction={signOutAction}
    >
      {children}
    </StaffShell>
  );
}
