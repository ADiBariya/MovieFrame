import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

export const metadata: Metadata = {
  title: "MovieFrame — Automate your cinematic content",
  description:
    "Scrape beautiful movie frames from film-grab.com and post them to Twitter/X automatically. The ultimate SaaS tool for cinephile content creators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#0A0A0F] text-[#F9FAFB] font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
