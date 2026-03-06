import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signIn } from "@/auth";

export default async function CustomerRegisterPage({
  searchParams
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const next = sp.next && sp.next.startsWith("/") ? sp.next : "/";

  async function registerAction(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").toLowerCase().trim();
    const password = String(formData.get("password") ?? "");
    const phone = String(formData.get("phone") ?? "").trim() || null;
    const region = String(formData.get("region") ?? "").trim() || null;
    const redirectTo = String(formData.get("redirectTo") ?? "/");

    if (!name || !email || !password) throw new Error("Missing required fields");

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
        phone,
        region,
        role: "CUSTOMER"
      }
    });

    await signIn("credentials", { email, password, loginAs: "customer", redirectTo });
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Create account</h1>
        <Link className="text-sm font-medium text-slate-600 hover:underline" href={`/customer/login?next=${encodeURIComponent(next)}`}>
          Login
        </Link>
      </div>

      <form action={registerAction} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <input type="hidden" name="redirectTo" value={next} />
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
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-900" htmlFor="phone">
              Phone (optional)
            </label>
            <input
              id="phone"
              name="phone"
              className="h-12 w-full rounded-xl bg-slate-50 px-3 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-slate-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-900" htmlFor="region">
              Zone (optional)
            </label>
            <input
              id="region"
              name="region"
              placeholder="e.g. Gandhi Nagar"
              className="h-12 w-full rounded-xl bg-slate-50 px-3 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-slate-300"
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-green-600 px-4 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
        >
          Create account
        </button>
      </form>

      <p className="text-xs text-slate-500">
        Staff accounts (manager/worker) are created by admins.
      </p>
    </div>
  );
}

