import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/ui/Nav';

export const metadata: Metadata = {
  title: 'Monetizely | Quoting Tool',
  description: 'Lightweight quoting tool for SaaS pricing — build and share professional quotes in minutes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
