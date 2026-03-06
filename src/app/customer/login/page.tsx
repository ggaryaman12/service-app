import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

export default async function CustomerLoginPage({
  searchParams
}: {
  searchParams?: Promise<{ next?: string; error?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const next = sp.next && sp.next.startsWith("/") ? sp.next : "/";
  const hasError = sp.error === "1";

  async function loginAction(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const redirectTo = String(formData.get("redirectTo") ?? "/");
    try {
      await signIn("credentials", { email, password, loginAs: "customer", redirectTo });
    } catch {
      redirect(`/customer/login?next=${encodeURIComponent(redirectTo)}&error=1`);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Customer login</h1>
        <p className="text-sm text-slate-500">Sign in to book services and track updates.</p>
      </div>

      {hasError ? (
        <div className="rounded-2xl bg-orange-50 p-3 text-sm text-orange-700 ring-1 ring-orange-200">
          Invalid email/password, or this account isn’t allowed on the customer login.
        </div>
      ) : null}

      <form action={loginAction} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <input type="hidden" name="redirectTo" value={next} />
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
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
        >
          Sign in
        </button>
      </form>

      <p className="text-sm text-slate-600">
        New here?{" "}
        <Link className="font-semibold text-slate-900 underline" href={`/customer/register?next=${encodeURIComponent(next)}`}>
          Create an account
        </Link>
        .
      </p>
    </div>
  );
}
