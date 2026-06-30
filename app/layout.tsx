import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { QueryProvider } from "@/components/layout/QueryProvider";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "القافلة — منصة إغاثة السودانيين",
  description:
    "منصة تربط السودانيين المحتاجين بالداعمين — حوجات، مفقودات، مفقودون، وحملات مباشرة.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={ibmPlexArabic.variable}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
