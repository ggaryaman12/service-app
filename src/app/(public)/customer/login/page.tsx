import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { TransitionLink } from "@/components/route-transition";

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
    } catch (error) {
      if (error instanceof AuthError) {
        redirect(`/customer/login?next=${encodeURIComponent(redirectTo)}&error=1`);
      }
      throw error;
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-5 md:grid-cols-[1fr_1.05fr]">
      <section className="rounded-ui-lg bg-brand-primary-muted p-5 ring-1 ring-border-subtle md:min-h-[420px]">
        <p className="text-caption font-semibold text-brand-primary">Customer access</p>
        <h1 className="mt-2 text-heading-2 text-text-primary">Book faster, track every visit.</h1>
        <p className="mt-3 text-body-sm text-text-secondary">
          Sign in to continue checkout, view assigned professionals, and keep your service history in one place.
        </p>
        <div className="mt-6 grid gap-3">
          <div className="rounded-ui bg-surface-elevated p-3">
            <p className="text-caption text-text-muted">Payment</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">Pay after service</p>
          </div>
          <div className="rounded-ui bg-surface-elevated p-3">
            <p className="text-caption text-text-muted">Updates</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">Status and professional details</p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-caption font-semibold text-brand-primary">Login</p>
          <h2 className="text-heading-3 text-text-primary">Welcome back</h2>
          <p className="text-body-sm text-text-secondary">Use the same customer email you registered with.</p>
        </div>

        {hasError ? (
          <div className="rounded-ui bg-brand-secondary-muted p-3 text-sm font-medium text-state-danger ring-1 ring-border-subtle">
            Invalid email/password, or this account isn’t allowed on the customer login.
          </div>
        ) : null}

        <form
          action={loginAction}
          className="space-y-4 rounded-ui-lg bg-surface-elevated p-5 shadow-card ring-1 ring-border-subtle"
        >
          <input type="hidden" name="redirectTo" value={next} />
          <div className="space-y-1">
            <label className="text-label text-text-primary" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="h-12 w-full rounded-ui bg-surface-muted px-3 text-sm text-text-primary ring-1 ring-border-subtle outline-none transition focus:bg-surface-elevated focus:ring-border-strong"
            />
          </div>
          <div className="space-y-1">
            <label className="text-label text-text-primary" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="h-12 w-full rounded-ui bg-surface-muted px-3 text-sm text-text-primary ring-1 ring-border-subtle outline-none transition focus:bg-surface-elevated focus:ring-border-strong"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand-primary px-4 text-sm font-semibold text-text-inverse shadow-button-primary transition hover:bg-brand-primary-hover active:scale-95"
          >
            Sign in
          </button>
        </form>

        <p className="text-body-sm text-text-secondary">
          New here?{" "}
          <TransitionLink
            className="font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline"
            href={`/customer/register?next=${encodeURIComponent(next)}`}
            transitionLabel="Register"
          >
            Create an account
          </TransitionLink>
          .
        </p>
      </div>
    </div>
  );
}
