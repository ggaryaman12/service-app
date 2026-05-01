export default function Loading() {
  return (
    <div className="grid gap-6 md:grid-cols-12">
      <div className="h-64 rounded-ui-lg skeleton-shimmer md:col-span-4" />
      <div className="space-y-4 md:col-span-8">
        <div className="h-24 rounded-ui-lg skeleton-shimmer" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-ui-lg skeleton-shimmer" />
        ))}
      </div>
    </div>
  );
}
