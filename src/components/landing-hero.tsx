import Link from "next/link";

type LandingHeroProps = {
  enabled: boolean;
  mediaType: string;
  mediaUrl: string | null;
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaHref: string | null;
};

export function LandingHero(props: LandingHeroProps) {
  if (!props.enabled) return null;

  const href = props.ctaHref ?? "/services";
  const isVideo = props.mediaType.toUpperCase() === "VIDEO";

  return (
    <section className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-4">
      <div className="relative h-[calc(100svh-72px)] min-h-[520px] w-full overflow-hidden bg-slate-950 md:h-[calc(100vh-72px)]">
        {props.mediaUrl ? (
          isVideo ? (
            <video
              className="absolute inset-0 h-full w-full object-cover opacity-70"
              src={props.mediaUrl}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="absolute inset-0 h-full w-full object-cover opacity-70"
              src={props.mediaUrl}
              alt=""
            />
          )
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-slate-950/10" />

        <div className="relative flex h-[calc(100svh-72px)] w-full flex-col justify-end px-4 pb-10 md:h-[calc(100vh-72px)] md:px-6 md:pb-16">
          <div className="max-w-xl space-y-3">
            <p className="text-xs font-semibold tracking-wide text-white/70">
              JammuServe • Pay after service (COD)
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
              {props.headline}
            </h1>
            <p className="text-sm text-white/80 md:text-base">{props.subheadline}</p>
            <div className="pt-2">
              <Link
                href={href}
                className="inline-flex h-12 items-center justify-center rounded-full bg-green-600 px-6 text-sm font-semibold text-white shadow-md transition-transform active:scale-95"
              >
                {props.ctaText}
              </Link>
              <Link
                href="/services"
                className="ml-3 inline-flex h-12 items-center justify-center rounded-full bg-white/10 px-6 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur-sm transition-transform active:scale-95"
              >
                Browse
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
