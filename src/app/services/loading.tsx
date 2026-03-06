export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-36 rounded-2xl bg-slate-200/70 animate-pulse" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 rounded-2xl bg-slate-200/70 animate-pulse" />
      ))}
    </div>
  );
}

