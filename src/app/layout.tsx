import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
