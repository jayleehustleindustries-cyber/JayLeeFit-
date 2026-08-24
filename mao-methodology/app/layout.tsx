import type { Metadata } from 'next';
import './globals.css';
import Navbar from './components/navbar';
import Footer from './components/footer';

export const metadata: Metadata = {
  title: 'MAO Methodology | Premium Fitness Coaching',
  description: 'Elite fitness coaching system with macro optimization and AI-powered training.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
