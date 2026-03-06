"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";

type BannerItem = {
  id: string;
  title: string;
  subtitle: string | null;
  tone: string;
  imageUrl?: string | null;
  href: string | null;
};

export function OffersCarouselClient({
  banners,
  autoScrollMs
}: {
  banners: BannerItem[];
  autoScrollMs: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const intervalMs = useMemo(() => {
    const ms = Number.isFinite(autoScrollMs) ? autoScrollMs : 4500;
    return Math.max(2000, Math.min(15000, ms));
  }, [autoScrollMs]);

  useEffect(() => {
    const el = ref.current;
    if (!el || banners.length <= 1) return;

    const id = window.setInterval(() => {
      const card = el.querySelector<HTMLElement>("[data-banner-card]");
      const step = card ? card.offsetWidth + 12 : 280;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const nextLeft = el.scrollLeft + step;
      el.scrollTo({ left: nextLeft >= maxScroll - 4 ? 0 : nextLeft, behavior: "smooth" });
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [banners.length, intervalMs]);

  return (
    <div
      ref={ref}
      className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:snap-none"
    >
      {banners.map((b) => (
        <div
          key={b.id}
          data-banner-card
          className="snap-start w-72 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 md:w-auto"
        >
          <div className="relative h-28 w-full bg-slate-100">
            {b.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={b.imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
            <div className="absolute bottom-2 left-2">
              <span
                className={[
                  "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 backdrop-blur-sm",
                  b.tone === "green"
                    ? "bg-green-600/20 text-green-50 ring-green-200/30"
                    : b.tone === "orange"
                      ? "bg-orange-500/20 text-orange-50 ring-orange-200/30"
                      : "bg-blue-600/20 text-blue-50 ring-blue-200/30"
                ].join(" ")}
              >
                Limited time
              </span>
            </div>
          </div>

          <div className="p-4">
            <p className="text-sm font-semibold text-slate-900">{b.title}</p>
            <p className="mt-1 text-sm text-slate-500">{b.subtitle}</p>
            <Link
              href={b.href ?? "/services"}
              className="mt-3 inline-flex h-11 items-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white transition-transform active:scale-95"
            >
              Explore
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
