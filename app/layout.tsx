import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShahnBid — Marketplace Fret Maroc',
  description: 'Plateforme de courtage fret B2B au Maroc.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
