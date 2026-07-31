import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EHC Data API',
  description: 'Centralized data sync service for inventory, images, and eBay listings',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
