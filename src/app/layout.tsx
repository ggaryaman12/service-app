import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MobileNav } from "@/components/mobile-nav";
import { AnnouncementBar } from "@/components/announcement-bar";
import { PageTransitionShell } from "@/components/page-transition-shell";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "JammuServe",
  description: "Hyper-local services marketplace for Jammu, India."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={[
          inter.className,
          "min-h-screen bg-surface-default text-text-primary antialiased"
        ].join(" ")}
      >
        <div className="flex min-h-screen w-full flex-col px-4 md:px-6">
          <SiteHeader />
          <AnnouncementBar />
          <main className="flex-1 pb-24 pt-4 md:pb-8">
            <PageTransitionShell>{children}</PageTransitionShell>
          </main>
          <SiteFooter />
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
