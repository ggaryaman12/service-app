export default function Loading() {
  return (
    <div className="loading-story-screen fixed inset-0 z-50 flex items-center px-4 text-text-inverse md:px-6">
      <div className="mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-2 md:items-end">
        <div>
          <p className="loading-story-eyebrow text-caption font-semibold uppercase tracking-widest text-text-inverse/70">
            Preparing JammuServe
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-none tracking-normal md:text-7xl">
            Mapping the right professional to your doorstep.
          </h1>
          <p className="mt-6 max-w-xl text-body text-text-inverse/75">
            We are loading the local service route, available slots, and customer flow before the
            page opens.
          </p>
        </div>

        <div className="loading-route-panel rounded-ui-lg border border-text-inverse/15 bg-text-inverse/10 p-5 backdrop-blur">
          <div className="loading-route-line" aria-hidden>
            <span />
          </div>
          <div className="mt-8 grid gap-3">
            {["Read request", "Match professional", "Open service route"].map((step, index) => (
              <div
                key={step}
                className="loading-route-step flex items-center justify-between rounded-ui border border-text-inverse/15 bg-text-inverse/10 px-4 py-4"
                style={{ animationDelay: `${index * 0.45}s` }}
              >
                <span className="text-label text-text-inverse">{step}</span>
                <span className="h-2 w-2 rounded-full bg-state-warning" aria-hidden />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
