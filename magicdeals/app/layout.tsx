import type { Metadata } from "next";
import { Fraunces, Libre_Franklin, Space_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CartDrawer from "@/components/cart-drawer";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const libreFranklin = Libre_Franklin({
  variable: "--font-libre",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MAGICDEALS 007 — Now you see it. Soon you don't.",
  description:
    "One-of-one secondhand finds, inspected and graded like a card trick. Every piece is the only one on the table — when it sells, it vanishes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${libreFranklin.variable} ${spaceMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-noir text-bone font-sans antialiased">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
