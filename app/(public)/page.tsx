import Link from 'next/link';
import { Truck, Package, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-brand-primary">ShahnBid</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-brand-primary transition-colors">
              Connexion
            </Link>
            <Link href="/register/client" className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-input hover:bg-brand-mid transition-colors">
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-brand-bg border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-navy leading-tight mb-4">
            Le fret B2B au Maroc,<br />
            <span className="text-brand-primary">simplifié.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            ShahnBid connecte les chargeurs avec les meilleurs transporteurs au Maroc. Publiez une expédition, recevez des offres compétitives ou réservez directement un camion de retour.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register/client" className="flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary text-white font-bold rounded-input hover:bg-brand-mid transition-colors">
              Je suis chargeur <ArrowRight size={18} />
            </Link>
            <Link href="/register/carrier" className="flex items-center justify-center gap-2 px-8 py-3 border-2 border-brand-primary text-brand-primary font-bold rounded-input hover:bg-brand-light transition-colors">
              Je suis transporteur <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-brand-navy text-center mb-14">Comment ça marche</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { icon: Package,     step: '1', title: 'Publiez votre expédition', desc: 'Décrivez votre marchandise, les villes de départ et d\'arrivée, et les dates souhaitées.' },
            { icon: Truck,       step: '2', title: 'Recevez des offres',        desc: 'Les transporteurs approuvés soumettent leurs offres avec prix et délai de livraison.' },
            { icon: ShieldCheck, step: '3', title: 'Confirmez et suivez',       desc: 'Acceptez la meilleure offre et suivez l\'avancement de votre expédition.' },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center mx-auto">
                <Icon size={24} className="text-brand-primary" />
              </div>
              <div className="text-xs font-bold text-brand-mid uppercase tracking-widest">Étape {step}</div>
              <h3 className="text-lg font-bold text-brand-navy">{title}</h3>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust numbers */}
      <section className="bg-brand-navy text-white py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '200+', label: 'Transporteurs approuvés' },
            { value: '1 200+', label: 'Expéditions réalisées' },
            { value: '97%', label: 'Taux de satisfaction' },
            { value: '24h', label: 'Délai moyen de première offre' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
              <div className="text-sm text-blue-200">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-border py-8 text-center text-sm text-gray-400 space-y-1">
        <div>© {new Date().getFullYear()} ShahnBid — Tous droits réservés</div>
        <Link href="/cgu" className="hover:text-brand-primary hover:underline">Conditions Générales d'Utilisation</Link>
      </footer>
    </div>
  );
}
