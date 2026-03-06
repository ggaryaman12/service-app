import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/staff/login?next=/worker");
  if (session.user.role !== "WORKER" && session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">Worker</h1>
        <p className="text-sm text-slate-500">Today’s jobs and status updates.</p>
      </div>
      {children}
    </div>
  );
}
