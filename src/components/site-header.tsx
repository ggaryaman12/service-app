import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

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
    <header className="sticky top-0 z-30 -mx-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="shrink-0 text-sm font-semibold tracking-tight text-slate-900">
            JammuServe
          </Link>
          <button
            type="button"
            aria-label="Current location"
            className="inline-flex h-11 min-w-0 items-center gap-1 rounded-full bg-slate-100 px-4 text-sm font-medium text-slate-700 transition-transform active:scale-95"
          >
            <span className="truncate">
              {region ? region : "Select location"}
            </span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-slate-500">
              <path d="M7 10l5 5 5-5H7z" />
            </svg>
          </button>
        </div>

        <nav className="flex items-center gap-1 text-sm text-slate-700">
          <div className="hidden items-center gap-1 md:flex">
            <Link
              href="/services"
              className="inline-flex h-11 items-center rounded-full px-4 font-medium hover:bg-slate-100 transition-transform active:scale-95"
            >
              Services
            </Link>
            {session?.user ? (
              <Link
                href="/account"
                className="inline-flex h-11 items-center rounded-full px-4 font-medium hover:bg-slate-100 transition-transform active:scale-95"
              >
                Bookings
              </Link>
            ) : null}
            {session?.user?.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="inline-flex h-11 items-center rounded-full px-4 font-medium hover:bg-slate-100 transition-transform active:scale-95"
              >
                Admin
              </Link>
            ) : null}
            {session?.user?.role === "MANAGER" || session?.user?.role === "ADMIN" ? (
              <Link
                href="/manager"
                className="inline-flex h-11 items-center rounded-full px-4 font-medium hover:bg-slate-100 transition-transform active:scale-95"
              >
                Manager
              </Link>
            ) : null}
            {session?.user?.role === "WORKER" || session?.user?.role === "ADMIN" ? (
              <Link
                href="/worker"
                className="inline-flex h-11 items-center rounded-full px-4 font-medium hover:bg-slate-100 transition-transform active:scale-95"
              >
                Worker
              </Link>
            ) : null}
          </div>
          {session?.user ? (
            <>
              <span className="hidden text-xs text-slate-500 sm:inline">
                {session.user.email} · {session.user.role}
              </span>
              <Link
                href="/account"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-slate-100 transition-transform active:scale-95 md:hidden"
                aria-label="Account"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-slate-700">
                  <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5 0-9 3-9 7v1h18v-1c0-4-4-7-9-7z" />
                </svg>
              </Link>
              <form action={signOutAction}>
                <button
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-slate-100 transition-transform active:scale-95"
                  type="submit"
                  aria-label="Sign out"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-slate-700">
                    <path d="M10 17l1.4-1.4L9.8 14H20v-2H9.8l1.6-1.6L10 9l-5 5 5 5zM4 4h8V2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h8v-2H4V4z" />
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/customer/login"
                className="inline-flex h-11 items-center rounded-full px-4 font-medium text-slate-700 hover:bg-slate-100 transition-transform active:scale-95"
              >
                Login
              </Link>
              <Link
                href="/customer/register"
                className="inline-flex h-11 items-center rounded-full bg-blue-600 px-4 font-semibold text-white shadow-sm transition-transform active:scale-95"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
