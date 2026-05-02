import {
  RouteTransitionContent,
  RouteTransitionProvider
} from "@/components/route-transition";

export default function StaffAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      data-staff-auth-shell
      className="grid min-h-screen bg-slate-100 px-4 py-10 text-slate-900"
    >
      <RouteTransitionContent className="m-auto w-full">{children}</RouteTransitionContent>
      <RouteTransitionProvider tone="staff" />
    </main>
  );
}
