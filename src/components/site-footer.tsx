export function SiteFooter() {
  return (
    <footer className="border-t border-border-subtle py-6 text-caption text-text-muted">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} JammuServe</p>
        <p>Pay-after-service (COD) only.</p>
      </div>
    </footer>
  );
}
