"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import {
  RouteTransitionContent,
  RouteTransitionProvider,
  TransitionLink
} from "@/components/route-transition";
import {
  operationsNav,
  portalThemeVars,
  portalThemes,
  type PortalThemeKey
} from "@/config/portal-themes";

function resolveTheme(): PortalThemeKey {
  return "worker";
}

function isActiveNav(pathname: string, href: string) {
  if (href === "/worker") return pathname === "/worker";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OperationsShell({
  children,
  userEmail,
  userName,
  userRole,
  signOutAction
}: {
  children: ReactNode;
  userEmail: string;
  userName?: string | null;
  userRole?: string | null;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const theme = portalThemes[resolveTheme()];
  const navItems = operationsNav.filter(
    (item) => userRole && (item.roles as readonly string[]).includes(userRole)
  );

  return (
    <div
      data-operations-shell
      style={portalThemeVars(theme)}
      className="fixed inset-0 z-50 overflow-hidden bg-[var(--portal-app-bg)] text-[var(--portal-text)]"
    >
      <div className="grid h-full lg:grid-cols-[18rem_1fr]">
        <aside className="hidden border-r border-[var(--portal-sidebar-border)] bg-[var(--portal-sidebar-bg)] text-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center gap-3 border-b border-[var(--portal-sidebar-border)] px-5">
            <TransitionLink href="/worker" transitionLabel={theme.title} className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-ui text-sm font-black text-white shadow-[0_18px_40px_rgba(0,0,0,0.22)]" style={{ backgroundColor: theme.colors.accent }}>
                {theme.initials}
              </span>
              <span>
                <span className="block text-sm font-black tracking-tight">{theme.brand}</span>
                <span className="block text-xs font-medium text-[var(--portal-sidebar-muted)]">
                  {theme.subtitle}
                </span>
              </span>
            </TransitionLink>
          </div>

          <nav aria-label="Operations navigation" className="flex-1 overflow-y-auto px-4 py-5">
            <div className="grid gap-2">
              {navItems.map((item) => {
                const active = isActiveNav(pathname, item.href);
                return (
                  <TransitionLink
                    key={item.href}
                    href={item.href}
                    transitionLabel={item.label}
                    className={[
                      "group flex min-h-12 items-center gap-3 rounded-ui-sm px-3 text-sm font-black transition-all duration-200",
                      active
                        ? "bg-[var(--portal-accent)] text-white shadow-[0_18px_38px_rgba(0,0,0,0.2)]"
                        : "text-white/68 hover:bg-white/8 hover:text-white"
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-8 w-8 shrink-0 place-items-center rounded-ui-sm text-[11px] font-black",
                        active ? "bg-black/18 text-white" : "bg-white/9 text-white/58 group-hover:text-white"
                      ].join(" ")}
                    >
                      {item.shortLabel}
                    </span>
                    <span>{item.label}</span>
                    <span className="ml-auto rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-white/55">
                      {portalThemes[item.theme].roleLabel}
                    </span>
                  </TransitionLink>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-[var(--portal-sidebar-border)] p-4">
            <div className="rounded-ui bg-white/7 p-3">
              <div className="mb-3 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/75">
                {userRole ?? theme.roleLabel}
              </div>
              <p className="truncate text-sm font-bold">{userName || theme.roleLabel}</p>
              <p className="mt-0.5 truncate text-xs text-[var(--portal-sidebar-muted)]">{userEmail}</p>
              <form action={signOutAction} className="mt-3">
                <button
                  type="submit"
                  className="h-9 w-full rounded-ui-sm bg-white/10 text-xs font-bold text-white transition-colors hover:bg-white/15"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col overflow-hidden">
          <header className="border-b border-[var(--portal-border)] bg-[var(--portal-app-bg)] backdrop-blur">
            <div className="flex min-h-20 items-center justify-between gap-4 px-4 lg:px-7">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--portal-accent-text)]">
                    {theme.eyebrow}
                  </p>
                  <span className="rounded-full bg-[var(--portal-accent-soft)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--portal-accent-text)]">
                    {theme.roleLabel}
                  </span>
                </div>
                <p className="mt-1 truncate text-lg font-black tracking-tight lg:text-xl">
                  {theme.title}
                </p>
              </div>
              <div className="hidden min-w-[18rem] max-w-sm flex-1 items-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 py-2.5 text-sm text-[var(--portal-text-muted)] shadow-[0_12px_28px_rgba(15,23,42,0.05)] md:flex">
                Search jobs, bookings, workers...
              </div>
              <form action={signOutAction} className="lg:hidden">
                <button
                  type="submit"
                  className="rounded-full bg-[var(--portal-sidebar-bg)] px-4 py-2 text-xs font-bold text-white"
                >
                  Sign out
                </button>
              </form>
            </div>
            <nav
              aria-label="Operations mobile navigation"
              className="flex gap-2 overflow-x-auto border-t border-[var(--portal-border)] px-4 py-3 lg:hidden"
            >
              {navItems.map((item) => {
                const active = isActiveNav(pathname, item.href);
                return (
                  <TransitionLink
                    key={item.href}
                    href={item.href}
                    transitionLabel={item.label}
                    className={[
                      "inline-flex h-10 shrink-0 items-center rounded-full px-4 text-sm font-black transition-colors",
                      active
                        ? "bg-[var(--portal-accent)] text-white"
                        : "border border-[var(--portal-border)] bg-[var(--portal-surface)] text-[var(--portal-text-muted)]"
                    ].join(" ")}
                  >
                    {item.label}
                  </TransitionLink>
                );
              })}
            </nav>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto scroll-smooth px-4 py-5 lg:px-7 lg:py-7">
            <RouteTransitionContent className="min-h-[70svh]">{children}</RouteTransitionContent>
          </main>
        </section>
      </div>
      <RouteTransitionProvider tone="operations" />
    </div>
  );
}
