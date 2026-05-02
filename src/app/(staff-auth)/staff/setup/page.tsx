import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signIn } from "@/auth";

export default async function StaffSetupPage() {
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount > 0) redirect("/staff/login");

  async function createAdminAction(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").toLowerCase().trim();
    const password = String(formData.get("password") ?? "");

    if (!name || !email || !password) throw new Error("Missing required fields");

    const stillNoAdmin = (await prisma.user.count({ where: { role: "ADMIN" } })) === 0;
    if (!stillNoAdmin) redirect("/staff/login");

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
        role: "ADMIN"
      }
    });

    await signIn("credentials", { email, password, loginAs: "staff", redirectTo: "/dashboard" });
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-4">
      <h1 className="text-xl font-semibold tracking-tight text-slate-900">Initial staff setup</h1>
      <p className="text-sm text-slate-500">
        Create the first admin account (one-time). Keep this URL private.
      </p>
      <form action={createAdminAction} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-900" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="h-12 w-full rounded-xl bg-slate-50 px-3 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-slate-300"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-900" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="h-12 w-full rounded-xl bg-slate-50 px-3 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-slate-300"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-900" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="h-12 w-full rounded-xl bg-slate-50 px-3 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-slate-300"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
        >
          Create admin
        </button>
      </form>
    </div>
  );
}
