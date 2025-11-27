import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/state/redux";
import { Toaster } from "react-hot-toast";
import { useGetAuthUserQuery } from "@/state/api";
import Routing from "@/components/routing";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Umgarn-Immo | Admin",
  description: "Admin panel for Ungarn-Immo real estate management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <StoreProvider>
      {/* <Routing /> */}
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <Toaster position="top-center" />
        </body>
      </StoreProvider>
    </html>
  );
}
