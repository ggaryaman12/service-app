"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { TransitionLink } from "@/components/route-transition";

type LandingHeroProps = {
  enabled: boolean;
  mediaType: string;
  mediaUrl: string | null;
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaHref: string | null;
};

const HeroScene = dynamic(
  () => import("./hero-scene").then((module) => module.HeroScene),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 hidden bg-surface-inverse md:block" aria-hidden />
    )
  }
);

const promiseSteps = [
  "home evaluated",
  "professional matched",
  "service underway"
] as const;

export function LandingHero(props: LandingHeroProps) {
  const reduceMotion = useReducedMotion();
  const [scrollY, setScrollY] = useState(0);
  const href = props.ctaHref ?? "/services";
  const normalizedMediaType = props.mediaType.toUpperCase();
  const hasVideo = normalizedMediaType === "VIDEO" && Boolean(props.mediaUrl);
  const hasImage = normalizedMediaType === "IMAGE" && Boolean(props.mediaUrl);

  useEffect(() => {
    let frame = 0;

    const syncScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrollY(window.scrollY));
    };

    syncScroll();
    window.addEventListener("scroll", syncScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", syncScroll);
    };
  }, []);

  const copyProgress = Math.min(scrollY / 300, 1);
  const mediaProgress = Math.min(scrollY / 760, 1);
  const railProgress = Math.min(scrollY / 320, 1);
  const routeProgress = Math.min(0.12 + (scrollY / 520) * 0.88, 1);
  const copyStyle = {
    opacity: 1 - copyProgress,
    transform: reduceMotion ? "none" : `translate3d(0, ${copyProgress * 120}px, 0)`
  };
  const mediaStyle = {
    transform: reduceMotion ? "none" : `scale(${1 + mediaProgress * 0.12})`
  };
  const sceneStyle = {
    transform: reduceMotion ? "none" : `scale(${1 + mediaProgress * 0.08})`
  };
  const serviceRailStyle = {
    opacity: 1 - railProgress,
    transform: reduceMotion ? "none" : `translate3d(0, ${railProgress * -96}px, 0)`
  };

  if (!props.enabled) return null;

  return (
    <section
      className="relative -mx-4 -mt-4 overflow-hidden bg-surface-inverse text-text-inverse md:-mx-6 md:-mt-4"
    >
      <div className="hero-frame relative isolate flex items-stretch">
        <motion.div
          aria-hidden
          className="absolute inset-0 z-0"
          style={mediaStyle}
        >
          {hasVideo ? (
            <video
              className="h-full w-full object-cover"
              src={props.mediaUrl ?? undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : hasImage ? (
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url("${props.mediaUrl ?? ""}")` }}
            />
          ) : (
            <div className="h-full w-full bg-surface-inverse" />
          )}
        </motion.div>

        <motion.div
          aria-hidden
          className="hero-scene-layer absolute inset-0 z-10 hidden md:block"
          style={sceneStyle}
        >
          <HeroScene reducedMotion={Boolean(reduceMotion)} active />
        </motion.div>

        <div className="hero-depth-overlay absolute inset-0 z-20" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 hero-story-fade" />

        <motion.div
          className="relative z-30 flex w-full flex-col justify-end px-4 pb-20 pt-24 md:px-6 md:pb-20"
          style={copyStyle}
        >
          <div className="max-w-4xl">
            <motion.p
              className="text-caption font-semibold uppercase tracking-widest text-text-inverse/70"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              JammuServe / service city live
            </motion.p>

            <motion.h1
              className="mt-4 max-w-4xl text-5xl font-semibold leading-none tracking-normal text-text-inverse sm:text-6xl md:text-8xl"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              {props.headline}
            </motion.h1>

            <motion.p
              className="mt-5 max-w-2xl text-base leading-7 text-text-inverse/80 md:text-lg"
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.62, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              {props.subheadline}
            </motion.p>

            <motion.div
              className="mt-7 flex flex-col gap-3 sm:flex-row"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.58, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              <TransitionLink
                href={href}
                transitionLabel={props.ctaText}
                className="inline-flex h-12 items-center justify-center rounded-full bg-brand-primary px-6 text-sm font-semibold text-text-inverse shadow-button-primary transition hover:bg-brand-primary-hover active:scale-95"
              >
                {props.ctaText}
              </TransitionLink>
              <TransitionLink
                href="/services"
                transitionLabel="Services"
                className="inline-flex h-12 items-center justify-center rounded-full bg-surface-default/10 px-6 text-sm font-semibold text-text-inverse ring-1 ring-text-inverse/20 backdrop-blur-md transition hover:bg-surface-default/20 active:scale-95"
              >
                Browse services
              </TransitionLink>
            </motion.div>

            <div className="mt-8 flex max-w-xl items-center gap-4">
              <div className="h-px flex-1 bg-text-inverse/30" />
              <p className="text-caption font-semibold uppercase tracking-widest text-text-inverse/70">
                Scroll for the service route
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute bottom-12 right-4 z-30 hidden w-72 md:right-6 md:block"
          style={serviceRailStyle}
          initial={reduceMotion ? false : { opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.62, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="space-y-2">
            {promiseSteps.map((step, index) => (
              <div
                key={step}
                className="flex items-center justify-between rounded-full border border-text-inverse/15 bg-surface-default/10 px-4 py-3 text-caption font-semibold uppercase tracking-widest text-text-inverse/80 backdrop-blur-md"
              >
                <span>{step}</span>
                <span className="h-2 w-2 rounded-full bg-brand-primary" aria-hidden />
                <span className="sr-only">Step {index + 1}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="pointer-events-none absolute bottom-6 left-4 right-4 z-30 md:left-auto md:w-72">
          <div className="h-1 overflow-hidden rounded-full bg-text-inverse/20">
            <motion.div
              className="h-full origin-left rounded-full bg-state-warning"
              style={{ transform: `scaleX(${routeProgress})` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
