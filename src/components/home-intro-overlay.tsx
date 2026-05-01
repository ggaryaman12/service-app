"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const introStages = [
  "Reading your service intent",
  "Scanning nearby professionals",
  "Preparing the doorstep route"
] as const;

export function HomeIntroOverlay() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const stars = useMemo(
    () =>
      Array.from({ length: 48 }, (_, index) => ({
        id: index,
        left: `${(index * 37) % 100}%`,
        top: `${(index * 61) % 100}%`,
        delay: `${(index % 9) * 0.24}s`,
        size: index % 7 === 0 ? "0.2rem" : "0.12rem"
      })),
    []
  );

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timeout = window.setTimeout(() => setVisible(false), 4600);

    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    if (!visible) document.body.style.overflow = "";
  }, [visible]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="home-intro-screen fixed inset-0 z-50 flex items-center px-4 text-text-inverse md:px-6"
          initial={reducedMotion ? false : { opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -24 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="polite"
          aria-label="Preparing JammuServe"
        >
          <div className="home-intro-stars" aria-hidden>
            {stars.map((star) => (
              <span
                key={star.id}
                style={{
                  left: star.left,
                  top: star.top,
                  width: star.size,
                  height: star.size,
                  animationDelay: star.delay
                }}
              />
            ))}
          </div>

          <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-[1fr_0.8fr] md:items-end">
            <div>
              <p className="home-intro-copy text-caption font-semibold uppercase tracking-widest text-text-inverse/70">
                JammuServe launch sequence
              </p>
              <h1 className="home-intro-copy mt-5 max-w-4xl text-5xl font-semibold leading-none tracking-normal md:text-7xl">
                Mapping the right professional to your doorstep.
              </h1>
              <p className="home-intro-copy mt-6 max-w-xl text-body text-text-inverse/75">
                We are aligning request details, local availability, and the service route before
                the home experience opens.
              </p>

              <div className="mt-9 max-w-xl">
                <div className="h-1 overflow-hidden rounded-full bg-text-inverse/18">
                  <div className="home-intro-progress h-full rounded-full bg-state-warning" />
                </div>
                <div className="mt-4 flex items-center justify-between text-caption font-semibold uppercase tracking-widest text-text-inverse/55">
                  <span>Request</span>
                  <span>Dispatch</span>
                  <span>Arrival</span>
                </div>
              </div>
            </div>

            <div className="home-intro-panel rounded-ui-lg border border-text-inverse/15 bg-text-inverse/10 p-5 backdrop-blur">
              <div className="home-intro-orbit" aria-hidden>
                <span />
                <span />
                <span />
              </div>
              <div className="mt-8 grid gap-3">
                {introStages.map((stage, index) => (
                  <div
                    key={stage}
                    className="home-intro-stage flex items-center justify-between rounded-ui border border-text-inverse/15 bg-text-inverse/10 px-4 py-4"
                    style={{ animationDelay: `${index * 0.5}s` }}
                  >
                    <span className="text-label text-text-inverse">{stage}</span>
                    <span className="h-2 w-2 rounded-full bg-state-warning" aria-hidden />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
