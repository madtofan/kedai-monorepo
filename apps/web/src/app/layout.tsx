import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";
import { Suspense } from "react";
import { TailwindIndicator } from "@/components/ui/tailwind-indicator";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kedai POS",
  description: "POS System for Malaysian Restaurants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense>
          <Providers>
            <div className="relative flex min-h-screen flex-col justify-between bg-background transition-all">
              {children}
            </div>
            <TailwindIndicator />
            <Toaster />
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}

