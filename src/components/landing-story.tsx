"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const moments = [
  {
    label: "01",
    title: "Describe the job",
    body: "Choose the exact service and add notes that help the professional arrive prepared."
  },
  {
    label: "02",
    title: "Dispatch matches locally",
    body: "The booking is routed around your slot, region, and current staff availability."
  },
  {
    label: "03",
    title: "Track the visit",
    body: "Status updates keep the customer, manager, and worker aligned until completion."
  }
] as const;

export function LandingStory() {
  const ref = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const lineScale = useTransform(scrollYProgress, [0.18, 0.82], [0, 1]);
  const orbX = useTransform(scrollYProgress, [0.18, 0.82], ["0%", "100%"]);

  return (
    <section
      ref={ref}
      className="story-frame relative -mx-4 px-4 text-text-inverse md:-mx-6 md:px-6"
    >
      <div className="story-sticky sticky top-20 mx-auto flex w-full max-w-6xl items-center py-14 md:py-20">
        <div className="w-full">
          <div className="grid gap-8 md:grid-cols-2 md:items-end">
            <div>
              <p className="text-caption font-semibold uppercase tracking-widest text-text-inverse/70">
                Doorstep operating system
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-normal md:text-5xl">
                The home gets ready before anyone rings the bell.
              </h2>
            </div>
            <p className="max-w-2xl text-body text-text-inverse/80">
              Every touchpoint is designed as a coordinated route: customer intent, local dispatch,
              professional context, and pay-after-service confirmation stay in one flow.
            </p>
          </div>

          <div className="relative mt-10 overflow-hidden rounded-ui-lg border border-text-inverse/20 bg-text-inverse/10 p-4 backdrop-blur md:p-6">
            <div className="absolute left-6 right-6 top-16 hidden h-px bg-text-inverse/25 md:block" />
            <motion.div
              className="absolute left-6 top-16 hidden h-px origin-left bg-state-warning md:block"
              style={{ scaleX: reducedMotion ? 1 : lineScale }}
            />
            <motion.div
              className="absolute top-16 hidden h-3 w-3 rounded-full bg-state-warning shadow-button-primary md:block"
              style={{ left: reducedMotion ? "100%" : orbX }}
            />

            <div className="grid gap-3 md:grid-cols-3">
              {moments.map((moment, index) => (
                <motion.div
                  key={moment.label}
                  className="relative min-h-48 rounded-ui bg-surface-elevated p-4 text-text-primary ring-1 ring-text-inverse/15"
                  initial={reducedMotion ? false : { opacity: 0, y: 28 }}
                  whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.08,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  <p className="text-caption font-semibold text-brand-secondary">{moment.label}</p>
                  <h3 className="mt-10 text-xl font-semibold tracking-normal text-text-primary">
                    {moment.title}
                  </h3>
                  <p className="mt-3 text-body-sm text-text-secondary">{moment.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
