import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { TransitionLink } from "@/components/route-transition";

export default async function StaffLoginPage({
  searchParams
}: {
  searchParams?: Promise<{ next?: string; error?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const next = sp.next && sp.next.startsWith("/") ? sp.next : "/dashboard";
  const hasError = sp.error === "1";

  async function loginAction(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const redirectTo = String(formData.get("redirectTo") ?? "/dashboard");
    try {
      await signIn("credentials", { email, password, loginAs: "staff", redirectTo });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect(`/staff/login?next=${encodeURIComponent(redirectTo)}&error=1`);
      }
      throw error;
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Staff login</h1>
        <p className="text-sm text-slate-500">Admins, managers, and workers only.</p>
      </div>

      {hasError ? (
        <div className="rounded-2xl bg-orange-50 p-3 text-sm text-orange-700 ring-1 ring-orange-200">
          Invalid email/password, or this account isn’t allowed on the staff login.
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
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
        >
          Sign in
        </button>
      </form>

      <p className="text-xs text-slate-500">
        Need to create the first admin? Go to{" "}
        <TransitionLink className="underline" href="/staff/setup" transitionLabel="Staff setup">
          /staff/setup
        </TransitionLink>
        .
      </p>
    </div>
  );
}
