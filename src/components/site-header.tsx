import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TransitionLink } from "@/components/route-transition";

export async function SiteHeader() {
  const session = await auth();
  const region =
    session?.user?.email
      ? (
          await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { region: true }
          })
        )?.region ?? null
      : null;

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <header className="sticky top-0 z-30 -mx-4 border-b border-border-subtle bg-surface-elevated/90 px-4 py-3 backdrop-blur-md md:-mx-6 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <TransitionLink
            href="/"
            transitionLabel="Home"
            className="inline-flex shrink-0 items-center gap-2 text-label text-text-primary transition-transform active:scale-95"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-brand-primary shadow-button-primary" />
            <span>JammuServe</span>
          </TransitionLink>
          <button
            type="button"
            aria-label="Current location"
            className="inline-flex h-11 min-w-0 items-center gap-1 rounded-full bg-surface-muted px-4 text-label text-text-secondary transition-colors hover:bg-brand-primary-muted active:scale-95"
          >
            <span className="truncate">
              {region ? region : "Select location"}
            </span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-text-muted">
              <path d="M7 10l5 5 5-5H7z" />
            </svg>
          </button>
        </div>

        <nav className="flex items-center gap-1 text-label text-text-secondary">
          <div className="hidden items-center gap-1 md:flex">
            <TransitionLink
              href="/services"
              transitionLabel="Services"
              className="inline-flex h-11 items-center rounded-full px-4 hover:bg-surface-muted transition-transform active:scale-95"
            >
              Services
            </TransitionLink>
            {session?.user ? (
              <TransitionLink
                href="/account"
                transitionLabel="Bookings"
                className="inline-flex h-11 items-center rounded-full px-4 hover:bg-surface-muted transition-transform active:scale-95"
              >
                Bookings
              </TransitionLink>
            ) : null}
            {session?.user?.role === "ADMIN" ? (
              <TransitionLink
                href="/dashboard"
                transitionLabel="Staff dashboard"
                className="inline-flex h-11 items-center rounded-full px-4 hover:bg-surface-muted transition-transform active:scale-95"
              >
                Dashboard
              </TransitionLink>
            ) : null}
            {session?.user?.role === "MANAGER" ? (
              <TransitionLink
                href="/dashboard"
                transitionLabel="Manager dashboard"
                className="inline-flex h-11 items-center rounded-full px-4 hover:bg-surface-muted transition-transform active:scale-95"
              >
                Manager
              </TransitionLink>
            ) : null}
            {session?.user?.role === "WORKER" || session?.user?.role === "ADMIN" ? (
              <TransitionLink
                href="/worker"
                transitionLabel="Worker"
                className="inline-flex h-11 items-center rounded-full px-4 hover:bg-surface-muted transition-transform active:scale-95"
              >
                Worker
              </TransitionLink>
            ) : null}
          </div>
          {session?.user ? (
            <>
              <span className="hidden text-caption text-text-muted sm:inline">
                {session.user.email} · {session.user.role}
              </span>
              <TransitionLink
                href="/account"
                transitionLabel="Account"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface-muted transition-transform active:scale-95 md:hidden"
                aria-label="Account"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-text-secondary">
                  <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5 0-9 3-9 7v1h18v-1c0-4-4-7-9-7z" />
                </svg>
              </TransitionLink>
              <form action={signOutAction}>
                <button
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface-muted transition-transform active:scale-95"
                  type="submit"
                  aria-label="Sign out"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-text-secondary">
                    <path d="M10 17l1.4-1.4L9.8 14H20v-2H9.8l1.6-1.6L10 9l-5 5 5 5zM4 4h8V2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h8v-2H4V4z" />
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <>
              <TransitionLink
                href="/customer/login"
                transitionLabel="Login"
                className="inline-flex h-11 items-center rounded-full px-4 text-text-secondary hover:bg-surface-muted transition-transform active:scale-95"
              >
                Login
              </TransitionLink>
              <TransitionLink
                href="/customer/register"
                transitionLabel="Register"
                className="inline-flex h-11 items-center rounded-full bg-brand-primary px-4 font-semibold text-text-inverse shadow-button-primary transition-colors hover:bg-brand-primary-hover active:scale-95"
              >
                Register
              </TransitionLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
