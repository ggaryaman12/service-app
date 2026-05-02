import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/staff/login?next=/worker");
  if (session.user.role !== "WORKER" && session.user.role !== "ADMIN") redirect("/");

  return children;
}
