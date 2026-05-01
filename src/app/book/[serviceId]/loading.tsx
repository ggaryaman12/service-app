export default function Loading() {
  return (
    <div className="grid gap-5 md:grid-cols-12">
      <div className="h-28 rounded-ui-lg skeleton-shimmer md:col-span-12" />
      <div className="space-y-4 md:col-span-7">
        <div className="h-52 rounded-ui-lg skeleton-shimmer" />
        <div className="h-44 rounded-ui-lg skeleton-shimmer" />
      </div>
      <div className="h-64 rounded-ui-lg skeleton-shimmer md:col-span-5" />
    </div>
  );
}
