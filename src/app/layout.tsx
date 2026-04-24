import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavTabs } from "@/components/nav-tabs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RecruiterStack | Staffing AI Rabbit Hole",
  description: "Problem-first GitHub funnel for staffing and recruiting agencies. Start with your agency type, pick your bottlenecks, and leave with a custom plan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <NavTabs />
        {children}
      </body>
    </html>
  );
}
