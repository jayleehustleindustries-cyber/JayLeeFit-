import type { Metadata } from "next";
import { Cormorant_Garamond, Libre_Franklin, Space_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CartDrawer from "@/components/cart-drawer";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "600"],
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
  title: "OLD LIGHT — Secondhand, Sold Under Old Light",
  description:
    "Authenticated pre-owned men's and women's clothing, graded by the moon and priced like it already lived a life. New finds weekly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${libreFranklin.variable} ${spaceMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-void text-chalk font-sans antialiased">
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
