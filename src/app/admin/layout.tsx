import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/staff/login?next=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Admin</h1>
          <p className="text-sm text-neutral-600">Back-office controls.</p>
        </div>
      </div>
      {children}
    </div>
  );
}
