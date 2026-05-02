export default function Loading() {
  return (
    <div className="grid gap-6 md:grid-cols-12">
      <div className="h-56 rounded-ui-lg skeleton-shimmer md:col-span-4" />
      <div className="space-y-4 md:col-span-8">
        <div className="h-16 rounded-ui-lg skeleton-shimmer" />
        <div className="h-72 rounded-ui-lg skeleton-shimmer" />
      </div>
    </div>
  );
}
