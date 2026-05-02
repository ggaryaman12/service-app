import { signOut, auth } from "@/auth";
import { OperationsShell } from "./_components/operations-shell";

export default async function OperationsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <OperationsShell
      userEmail={session?.user?.email ?? "Not signed in"}
      userName={session?.user?.name}
      userRole={session?.user?.role}
      signOutAction={signOutAction}
    >
      {children}
    </OperationsShell>
  );
}
