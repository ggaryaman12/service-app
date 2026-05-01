"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function NavIcon({
  active,
  children
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={[
        "inline-flex h-6 w-6 items-center justify-center",
        active ? "text-brand-primary" : "text-text-muted"
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/service/") ||
    pathname.startsWith("/book/") ||
    pathname.startsWith("/checkout")
  ) {
    return null;
  }

  const items = [
    { href: "/", label: "Home", key: "home" },
    { href: "/services", label: "Services", key: "services" },
    { href: "/account", label: "Bookings", key: "bookings" },
    { href: "/account", label: "Account", key: "account" }
  ] as const;

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-2xl border-t border-border-subtle bg-surface-elevated/90 backdrop-blur-md md:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
    >
      <div className="grid grid-cols-4 px-2 py-2">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex h-11 flex-col items-center justify-center gap-1 rounded-ui-sm transition-colors hover:bg-surface-muted active:scale-95"
              aria-label={item.label}
            >
              <NavIcon active={active}>
                {item.key === "home" ? (
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                    <path d="M12 3l9 8h-3v10h-5v-6H11v6H6V11H3l9-8z" />
                  </svg>
                ) : item.key === "services" ? (
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                    <path d="M4 5h16v4H4V5zm0 6h7v8H4v-8zm9 0h7v8h-7v-8z" />
                  </svg>
                ) : item.key === "bookings" ? (
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                    <path d="M7 2h10v2h3v18H4V4h3V2zm2 4v2h6V6H9zm0 6h10v-2H9v2zm0 4h10v-2H9v2z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5 0-9 3-9 7v1h18v-1c0-4-4-7-9-7z" />
                  </svg>
                )}
              </NavIcon>
              <span
                className={[
                  "text-[11px] font-medium",
                  active ? "text-brand-primary" : "text-text-muted"
                ].join(" ")}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
