import { AnnouncementBar } from "@/components/announcement-bar";
import { MobileNav } from "@/components/mobile-nav";
import {
  RouteTransitionContent,
  RouteTransitionProvider
} from "@/components/route-transition";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-public-shell className="flex min-h-screen w-full flex-col px-4 md:px-6">
      <SiteHeader />
      <AnnouncementBar />
      <main className="flex-1 pb-24 pt-4 md:pb-8">
        <RouteTransitionContent>{children}</RouteTransitionContent>
      </main>
      <SiteFooter />
      <MobileNav />
      <RouteTransitionProvider tone="public" />
    </div>
  );
}
