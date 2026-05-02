"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import {
  Suspense,
  useEffect,
  useRef,
  useState
} from "react";

type TransitionTone = "public" | "admin" | "operations" | "staff";

type PendingNavigation = {
  label: string;
  fromPath: string;
  startedAt: number;
};

type NavigationStartEvent = CustomEvent<{
  label?: string;
}>;

const ROUTE_TRANSITION_EVENT = "jammuserve:route-transition-start";

function announceNavigation(label?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(ROUTE_TRANSITION_EVENT, {
      detail: { label }
    })
  );
}

function transitionCopy(tone: TransitionTone) {
  if (tone === "admin") {
    return {
      eyebrow: "Command Center",
      title: "Loading workspace",
      detail: "Keeping the console mounted while the next admin surface streams in."
    };
  }

  if (tone === "operations") {
    return {
      eyebrow: "Operations",
      title: "Syncing workspace",
      detail: "Holding the portal shell steady while live work queues update."
    };
  }

  if (tone === "staff") {
    return {
      eyebrow: "Secure Staff Access",
      title: "Preparing session",
      detail: "Connecting the staff entry point."
    };
  }

  return {
    eyebrow: "JammuServe",
    title: "Loading service flow",
    detail: "Keeping your place while the next page is prepared."
  };
}

function overlayPalette(tone: TransitionTone) {
  if (tone === "public") {
    return {
      accent: "bg-[#d49b2f]",
      accentText: "text-[#f5c15a]",
      panel: "border-white/12 bg-[#101510]/88",
      ring: "border-[#d49b2f]/35"
    };
  }

  if (tone === "operations") {
    return {
      accent: "bg-[#3b82f6]",
      accentText: "text-[#93c5fd]",
      panel: "border-white/12 bg-[#0f172a]/88",
      ring: "border-[#60a5fa]/35"
    };
  }

  return {
    accent: "bg-[#f3b43f]",
    accentText: "text-[#f3b43f]",
    panel: "border-white/12 bg-[#191816]/90",
    ring: "border-[#f3b43f]/35"
  };
}

export function RouteTransitionProvider({
  tone = "public"
}: {
  tone?: TransitionTone;
}) {
  return (
    <Suspense fallback={null}>
      <RouteTransitionOverlay tone={tone} />
    </Suspense>
  );
}

function RouteTransitionOverlay({ tone }: { tone: TransitionTone }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const routeKey = search ? `${pathname}?${search}` : pathname;
  const reducedMotion = useReducedMotion();
  const routeKeyRef = useRef(routeKey);
  const [pending, setPending] = useState<PendingNavigation | null>(null);
  const copy = transitionCopy(tone);
  const palette = overlayPalette(tone);

  useEffect(() => {
    routeKeyRef.current = routeKey;
  }, [routeKey]);

  useEffect(() => {
    function handleNavigationStart(event: Event) {
      const detail = (event as NavigationStartEvent).detail;
      setPending({
        label: detail?.label ?? "Next page",
        fromPath: routeKeyRef.current,
        startedAt: Date.now()
      });
    }

    window.addEventListener(ROUTE_TRANSITION_EVENT, handleNavigationStart);
    return () => window.removeEventListener(ROUTE_TRANSITION_EVENT, handleNavigationStart);
  }, []);

  useEffect(() => {
    if (!pending) return;

    const routeChanged = pending.fromPath !== routeKey;
    const elapsed = Date.now() - pending.startedAt;
    const delay = routeChanged ? Math.max(0, 520 - elapsed) : 2400;

    const timeout = window.setTimeout(() => {
      setPending(null);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [routeKey, pending]);

  return (
    <>
      <AnimatePresence>
        {pending ? (
          <motion.div
            key="route-transition-overlay"
            data-route-transition-overlay
            role="status"
            aria-live="polite"
            className="fixed inset-0 z-[120] grid place-items-center overflow-hidden bg-[#070806]/72 px-5 text-white backdrop-blur-md"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className={[
                "absolute inset-0 opacity-70",
                "bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:5rem_5rem]"
              ].join(" ")}
              initial={reducedMotion ? undefined : { backgroundPosition: "0rem 0rem" }}
              animate={reducedMotion ? undefined : { backgroundPosition: "5rem 3rem" }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className={[
                "relative w-[min(34rem,calc(100vw-2.5rem))] overflow-hidden rounded-[1.75rem] border p-6 shadow-[0_3rem_8rem_rgba(0,0,0,0.42)]",
                palette.panel
              ].join(" ")}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start gap-4">
                <span
                  className={[
                    "relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl border bg-white/8",
                    palette.ring
                  ].join(" ")}
                >
                  <span className={["absolute h-8 w-8 rounded-full opacity-30 motion-safe:animate-ping", palette.accent].join(" ")} />
                  <span className={["relative h-3 w-3 rounded-full", palette.accent].join(" ")} />
                </span>
                <span className="min-w-0">
                  <span className={["block text-[11px] font-black uppercase tracking-[0.22em]", palette.accentText].join(" ")}>
                    {copy.eyebrow}
                  </span>
                  <span className="mt-2 block text-2xl font-black tracking-tight">
                    {copy.title}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-white/68">
                    {copy.detail}
                  </span>
                  <span className="mt-4 block truncate text-sm font-bold text-white">
                    {pending.label}
                  </span>
                </span>
              </div>
              <span className="mt-6 block h-1.5 overflow-hidden rounded-full bg-white/12">
                <motion.span
                  className={["block h-full w-2/5 rounded-full", palette.accent].join(" ")}
                  initial={reducedMotion ? { x: "0%" } : { x: "-105%" }}
                  animate={reducedMotion ? { x: "0%" } : { x: "265%" }}
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { duration: 0.92, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }
                  }
                />
              </span>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export function RouteTransitionContent({
  children,
  className = "min-h-[50svh]"
}: {
  children: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className={["will-change-transform", className].join(" ")}
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.996 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -6, scale: 0.998 }}
        transition={{
          opacity: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
          y: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
          scale: { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function shouldUseNativeNavigation(
  event: MouseEvent<HTMLAnchorElement>,
  target?: string
) {
  return (
    event.defaultPrevented ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0 ||
    Boolean(target && target !== "_self")
  );
}

function isExternalHref(href: string) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href);
}

type TransitionLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  transitionLabel?: string;
};

export function TransitionLink({
  href,
  transitionLabel,
  onClick,
  target,
  children,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();

  if (isExternalHref(href)) {
    return (
      <a href={href} target={target} onClick={onClick} {...props}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      target={target}
      onClick={(event) => {
        onClick?.(event);
        if (shouldUseNativeNavigation(event, target)) return;

        const destination = new URL(href, window.location.origin);
        const currentPath = `${window.location.pathname}${window.location.search}`;
        const destinationPath = `${destination.pathname}${destination.search}`;

        if (destinationPath === currentPath) {
          event.preventDefault();
          return;
        }

        event.preventDefault();
        announceNavigation(transitionLabel ?? props["aria-label"] ?? undefined);
        router.push(href);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
