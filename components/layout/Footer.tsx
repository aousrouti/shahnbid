import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-brand-border bg-white px-6 py-3 text-xs text-gray-400 flex items-center justify-between">
      <span>© 2026 ShahnBid</span>
      <Link href="/cgu" className="hover:text-brand-primary hover:underline">Conditions Générales</Link>
    </footer>
  );
}
