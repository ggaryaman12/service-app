"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import {
  RouteTransitionContent,
  RouteTransitionProvider,
  TransitionLink
} from "@/components/route-transition";
import {
  portalThemeVars,
  portalThemes,
  type PortalThemeKey
} from "@/config/portal-themes";
import type { AccessPermission } from "@/features/operations/operations-access";

const staffNavItems: Array<{
  href: string;
  label: string;
  code: string;
  permission?: AccessPermission;
  adminOnly?: boolean;
}> = [
  { href: "/dashboard", label: "Dashboard", code: "DB" },
  { href: "/bookings", label: "Bookings", code: "BK", permission: "bookings.view" },
  { href: "/dispatch", label: "Dispatch", code: "DP", permission: "dispatch.view" },
  { href: "/catalog/categories", label: "Categories", code: "CA", permission: "catalog.view" },
  { href: "/catalog/services", label: "Services", code: "SV", permission: "catalog.view" },
  { href: "/marketing", label: "Marketing", code: "MK", permission: "marketing.manage" },
  {
    href: "/integration-channels",
    label: "Integration Channels",
    code: "IN",
    permission: "integrations.manage"
  },
  { href: "/roles", label: "Roles", code: "RO", adminOnly: true },
  { href: "/managers", label: "Managers", code: "MG", adminOnly: true }
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StaffShell({
  children,
  userEmail,
  userName,
  userRole,
  accessRoleName,
  permissions,
  signOutAction
}: {
  children: ReactNode;
  userEmail: string;
  userName?: string | null;
  userRole: string;
  accessRoleName?: string | null;
  permissions: AccessPermission[];
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const themeKey: PortalThemeKey = userRole === "ADMIN" ? "admin" : "manager";
  const theme = portalThemes[themeKey];
  const permissionSet = new Set(permissions);
  const navItems = staffNavItems.filter((item) => {
    if (userRole === "ADMIN") return true;
    if (item.adminOnly) return false;
    if (!item.permission) return permissions.length > 0;
    return permissionSet.has(item.permission);
  });

  return (
    <div
      data-staff-shell
      data-admin-shell={userRole === "ADMIN" ? true : undefined}
      style={portalThemeVars(theme)}
      className="fixed inset-0 z-50 overflow-hidden bg-[var(--portal-app-bg)] text-[var(--portal-text)]"
    >
      <div className="grid h-full lg:grid-cols-[18rem_1fr]">
        <aside className="hidden border-r border-[var(--portal-sidebar-border)] bg-[var(--portal-sidebar-bg)] text-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center gap-3 border-b border-[var(--portal-sidebar-border)] px-5">
            <TransitionLink href="/dashboard" transitionLabel="Dashboard" className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-ui bg-[var(--portal-accent)] text-sm font-black text-white shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
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

          <nav aria-label="Staff navigation" className="flex-1 overflow-y-auto px-4 py-5">
            <div className="grid gap-2">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <TransitionLink
                    key={item.href}
                    href={item.href}
                    transitionLabel={item.label}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "group flex min-h-11 items-center gap-3 rounded-ui-sm px-3 text-sm font-black transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:translate-x-0.5",
                      active
                        ? "bg-[var(--portal-accent)] text-white shadow-[0_16px_34px_rgba(0,0,0,0.2)]"
                        : "text-white/68 hover:bg-white/8 hover:text-white"
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-8 w-8 shrink-0 place-items-center rounded-ui-sm text-[11px] font-black",
                        active ? "bg-black/18 text-white" : "bg-white/9 text-white/58"
                      ].join(" ")}
                    >
                      {item.code}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </TransitionLink>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-[var(--portal-sidebar-border)] p-4">
            <div className="rounded-ui bg-white/7 p-3">
              <div className="mb-3 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/75">
                {accessRoleName ?? userRole}
              </div>
              <p className="truncate text-sm font-bold">{userName || userRole}</p>
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
          <header className="border-b border-[var(--portal-border)] bg-[var(--portal-app-bg)]/96 backdrop-blur">
            <div className="flex min-h-20 items-center justify-between gap-4 px-4 lg:px-7">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--portal-accent-text)]">
                    {theme.eyebrow}
                  </p>
                  <span className="rounded-full bg-[var(--portal-accent-soft)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--portal-accent-text)]">
                    {accessRoleName ?? theme.roleLabel}
                  </span>
                </div>
                <p className="mt-1 truncate text-lg font-black tracking-tight lg:text-xl">
                  {theme.title}
                </p>
              </div>
              <div className="hidden min-w-[18rem] max-w-sm flex-1 items-center rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-4 py-2.5 text-sm text-[var(--portal-text-muted)] shadow-[0_12px_28px_rgba(15,23,42,0.05)] md:flex">
                Search bookings, users, services...
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
              aria-label="Staff mobile navigation"
              className="flex gap-2 overflow-x-auto border-t border-[var(--portal-border)] px-4 py-3 lg:hidden"
            >
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <TransitionLink
                    key={item.href}
                    href={item.href}
                    transitionLabel={item.label}
                    aria-current={active ? "page" : undefined}
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
      <RouteTransitionProvider tone={themeKey === "admin" ? "admin" : "operations"} />
    </div>
  );
}
