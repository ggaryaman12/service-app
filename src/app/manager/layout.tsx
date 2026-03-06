import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function ManagerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/staff/login?next=/manager");
  if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Manager</h1>
        <p className="text-sm text-neutral-600">Dispatch and booking operations.</p>
      </div>
      {children}
    </div>
  );
}
