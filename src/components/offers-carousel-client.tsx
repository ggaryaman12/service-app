"use client";

import { motion } from "framer-motion";
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
        <motion.div
          key={b.id}
          data-banner-card
          className="snap-start w-72 shrink-0 overflow-hidden rounded-ui-lg bg-surface-elevated shadow-card ring-1 ring-border-subtle md:w-auto"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="relative h-28 w-full bg-surface-muted">
            {b.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={b.imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-brand-secondary-muted" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
            <div className="absolute bottom-2 left-2">
              <span
                className={[
                  "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 backdrop-blur-sm",
                  b.tone === "green"
                    ? "bg-brand-primary/20 text-text-inverse ring-white/30"
                    : b.tone === "orange"
                      ? "bg-state-warning/20 text-text-inverse ring-white/30"
                      : "bg-brand-secondary/20 text-text-inverse ring-white/30"
                ].join(" ")}
              >
                Limited time
              </span>
            </div>
          </div>

          <div className="p-4">
            <p className="text-body-sm font-semibold text-text-primary">{b.title}</p>
            <p className="mt-1 text-body-sm text-text-secondary">{b.subtitle}</p>
            <Link
              href={b.href ?? "/services"}
              className="mt-3 inline-flex h-11 items-center rounded-full bg-surface-inverse px-4 text-label text-text-inverse transition-transform active:scale-95"
            >
              Explore
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
