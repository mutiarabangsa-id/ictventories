import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "MBS ICT Inventory",
  description: "ICT Inventory, Request & Borrowing System - Mutiara Bangsa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-white text-[#0a0b0d] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
