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
    <div className="mx-auto grid w-full max-w-5xl gap-5 md:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-ui-lg bg-brand-primary-muted p-5 ring-1 ring-border-subtle md:min-h-[520px]">
        <p className="text-caption font-semibold text-brand-primary">New customer</p>
        <h1 className="mt-2 text-heading-2 text-text-primary">Set up service booking in a minute.</h1>
        <p className="mt-3 text-body-sm text-text-secondary">
          Create your customer profile once, then reuse it for checkout, tracking, and professional contact details.
        </p>
        <div className="mt-6 space-y-3">
          <div className="rounded-ui bg-surface-elevated p-3">
            <p className="text-caption text-text-muted">Checkout</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">Address and slot saved per booking</p>
          </div>
          <div className="rounded-ui bg-surface-elevated p-3">
            <p className="text-caption text-text-muted">Payments</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">Cash on delivery / pay after service</p>
          </div>
          <div className="rounded-ui bg-surface-elevated p-3">
            <p className="text-caption text-text-muted">Staff accounts</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">Created separately by admins</p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-caption font-semibold text-brand-primary">Register</p>
            <h2 className="mt-1 text-heading-3 text-text-primary">Create account</h2>
          </div>
          <Link
            className="inline-flex h-10 items-center rounded-full bg-surface-muted px-4 text-sm font-semibold text-text-secondary transition hover:bg-brand-primary-muted"
            href={`/customer/login?next=${encodeURIComponent(next)}`}
          >
            Login
          </Link>
        </div>

        <form
          action={registerAction}
          className="space-y-4 rounded-ui-lg bg-surface-elevated p-5 shadow-card ring-1 ring-border-subtle"
        >
          <input type="hidden" name="redirectTo" value={next} />
          <div className="space-y-1">
            <label className="text-label text-text-primary" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              className="h-12 w-full rounded-ui bg-surface-muted px-3 text-sm text-text-primary ring-1 ring-border-subtle outline-none transition focus:bg-surface-elevated focus:ring-border-strong"
            />
          </div>
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-label text-text-primary" htmlFor="phone">
                Phone (optional)
              </label>
              <input
                id="phone"
                name="phone"
                className="h-12 w-full rounded-ui bg-surface-muted px-3 text-sm text-text-primary ring-1 ring-border-subtle outline-none transition focus:bg-surface-elevated focus:ring-border-strong"
              />
            </div>
            <div className="space-y-1">
              <label className="text-label text-text-primary" htmlFor="region">
                Zone (optional)
              </label>
              <input
                id="region"
                name="region"
                placeholder="e.g. Gandhi Nagar"
                className="h-12 w-full rounded-ui bg-surface-muted px-3 text-sm text-text-primary ring-1 ring-border-subtle outline-none transition focus:bg-surface-elevated focus:ring-border-strong"
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand-primary px-4 text-sm font-semibold text-text-inverse shadow-button-primary transition hover:bg-brand-primary-hover active:scale-95"
          >
            Create account
          </button>
        </form>

        <p className="text-caption text-text-muted">
          Staff accounts (manager/worker) are created by admins.
        </p>
      </div>
    </div>
  );
}
