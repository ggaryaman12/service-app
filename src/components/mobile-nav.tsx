"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavIcon({
  active,
  children
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={[
        "inline-flex h-6 w-6 items-center justify-center",
        active ? "text-blue-600" : "text-slate-500"
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Home", key: "home" },
    { href: "/account", label: "Bookings", key: "bookings" },
    { href: "/account", label: "Profile", key: "profile" }
  ] as const;

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-2xl border-t border-slate-200 bg-white/90 backdrop-blur-md md:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
    >
      <div className="grid grid-cols-3 px-2 py-2">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex h-11 flex-col items-center justify-center gap-1 rounded-xl transition-transform active:scale-95"
              aria-label={item.label}
            >
              <NavIcon active={active}>
                {item.key === "home" ? (
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                    <path d="M12 3l9 8h-3v10h-5v-6H11v6H6V11H3l9-8z" />
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
                  active ? "text-blue-600" : "text-slate-500"
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
