import Link from 'next/link';

export const metadata = { title: 'Conditions Générales — ShahnBid' };

const EFFECTIVE = '22 juin 2026';

function Article({ id, n, title, children }: { id?: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="text-lg font-bold text-brand-navy mt-8 mb-2">Article {n} — {title}</h2>
      <div className="space-y-2 text-sm text-gray-700 leading-relaxed">{children}</div>
    </section>
  );
}

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="bg-white border-b border-brand-border">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-brand-primary">ShahnBid</Link>
          <Link href="/login" className="text-sm text-brand-primary hover:underline">Se connecter</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8">
        <h1 className="text-2xl font-bold text-brand-navy">Conditions Générales d'Utilisation</h1>
        <p className="text-sm text-gray-500 mt-1">En vigueur le {EFFECTIVE}</p>

        <div className="mt-4 rounded-card border border-amber-200 bg-amber-50 text-amber-800 text-sm px-4 py-3">
          <b>Modèle à valider.</b> Ce document est un projet fourni à titre indicatif. Faites-le réviser par un conseil
          juridique avant toute mise en production réelle.
        </div>

        {/* Quick nav */}
        <nav className="mt-5 flex flex-wrap gap-2 text-xs">
          <a href="#chargeur" className="px-3 py-1 rounded-full border border-brand-border bg-white text-brand-primary font-medium hover:bg-brand-light">Obligations du Chargeur</a>
          <a href="#transporteur" className="px-3 py-1 rounded-full border border-brand-border bg-white text-brand-primary font-medium hover:bg-brand-light">Obligations du Transporteur</a>
        </nav>

        <Article n={1} title="Objet">
          <p>Les présentes Conditions Générales d'Utilisation (« CGU ») régissent l'accès et l'utilisation de la
          plateforme ShahnBid (la « Plateforme »), qui met en relation des chargeurs souhaitant expédier des
          marchandises et des transporteurs disposant de capacités de transport, au Maroc et à l'international.</p>
          <p>Toute inscription et utilisation de la Plateforme emporte acceptation pleine et entière des présentes CGU.</p>
        </Article>

        <Article n={2} title="Définitions">
          <ul className="list-disc pl-5 space-y-1">
            <li><b>Plateforme</b> : le service en ligne ShahnBid.</li>
            <li><b>Chargeur</b> : utilisateur (particulier ou entreprise) publiant des expéditions.</li>
            <li><b>Transporteur</b> : professionnel du transport approuvé proposant des offres.</li>
            <li><b>Expédition</b> : demande de transport publiée par un Chargeur.</li>
            <li><b>Offre</b> : proposition de prix et de délai soumise par un Transporteur.</li>
            <li><b>Retour</b> : capacité de transport de retour proposée par un Transporteur à prix fixe.</li>
            <li><b>Commission</b> : frais de service prélevés par la Plateforme.</li>
          </ul>
        </Article>

        <Article n={3} title="Rôle de ShahnBid">
          <p>ShahnBid agit exclusivement comme <b>intermédiaire technique de mise en relation</b>. La Plateforme n'est
          pas transporteur, n'exécute aucune prestation de transport et n'est pas partie au contrat de transport conclu
          directement entre le Chargeur et le Transporteur.</p>
          <p>ShahnBid ne garantit pas la conclusion d'une transaction ni la qualité des prestations réalisées entre
          utilisateurs, sans préjudice du processus d'approbation des Transporteurs prévu à l'Article 4.</p>
        </Article>

        <Article n={4} title="Inscription, comptes et approbation">
          <p>L'utilisateur garantit l'exactitude des informations fournies et s'engage à les tenir à jour. Il est
          responsable de la confidentialité de ses identifiants.</p>
          <p>Les comptes Transporteur sont soumis à une <b>approbation préalable</b> par ShahnBid (vérification de la
          licence et de l'assurance). Un Transporteur ne peut soumettre d'offres qu'après approbation. ShahnBid peut
          refuser, suspendre ou révoquer une approbation à tout moment en cas de manquement.</p>
        </Article>

        <Article id="chargeur" n={5} title="Obligations du Chargeur">
          <ul className="list-disc pl-5 space-y-1">
            <li>Décrire la marchandise de manière exacte et complète (nature, poids, dimensions, particularités : fragile, dangereux, etc.).</li>
            <li>N'expédier que des marchandises licites et conformes à la réglementation (voir Article 12).</li>
            <li>Assurer un emballage adapté et la disponibilité aux dates d'enlèvement indiquées.</li>
            <li>Régler le prix convenu avec le Transporteur ainsi que la commission de la Plateforme.</li>
            <li>Souscrire, le cas échéant, une assurance couvrant la valeur de la marchandise transportée.</li>
            <li>Communiquer de bonne foi et ne pas contourner la Plateforme pour éviter la commission.</li>
          </ul>
        </Article>

        <Article id="transporteur" n={6} title="Obligations du Transporteur">
          <ul className="list-disc pl-5 space-y-1">
            <li>Détenir une licence de transport valide et une assurance responsabilité civile professionnelle en cours de validité.</li>
            <li>Maintenir des véhicules conformes, en bon état et adaptés à la marchandise (ex. frigorifique, hors gabarit).</li>
            <li>Respecter les délais, l'itinéraire et les conditions acceptés dans l'offre.</li>
            <li>Assumer la garde et la responsabilité de la marchandise pendant le transport, jusqu'à livraison.</li>
            <li>Mettre à jour le statut de l'expédition (collecte, transit, livraison) en temps réel.</li>
            <li>Ne pas sous-traiter sans l'accord du Chargeur et ne pas contourner la Plateforme.</li>
          </ul>
        </Article>

        <Article n={7} title="Déroulement d'une transaction">
          <p>Le Chargeur publie une Expédition ; les Transporteurs approuvés soumettent des Offres ; le Chargeur
          accepte une Offre, ce qui forme le contrat de transport entre les deux parties. Le Transporteur met à jour le
          statut jusqu'à la livraison, que le Chargeur confirme. Les Retours suivent un processus de réservation à prix
          fixe équivalent.</p>
        </Article>

        <Article n={8} title="Prix, commission et TVA">
          <p>Le prix du transport est librement convenu entre le Chargeur et le Transporteur via l'Offre acceptée.
          ShahnBid prélève une <b>commission</b> sur chaque expédition aboutie, majorée de la TVA applicable. Le taux et
          les modalités sont indiqués sur la Plateforme et peuvent évoluer ; le taux applicable est figé au moment de
          l'acceptation de l'offre.</p>
        </Article>

        <Article n={9} title="Paiements">
          <p>Les modalités de paiement et, le cas échéant, de versement au Transporteur sont précisées sur la
          Plateforme. ShahnBid peut recourir à des prestataires de paiement tiers. Tout impayé peut entraîner la
          suspension du compte.</p>
        </Article>

        <Article n={10} title="Annulation et modification">
          <p>Une Expédition peut être modifiée ou annulée par le Chargeur tant qu'aucune Offre n'a été acceptée. Après
          acceptation, l'annulation relève de l'accord entre les parties et peut donner lieu à des frais. Un
          Transporteur peut retirer une Offre tant qu'elle est en attente.</p>
        </Article>

        <Article n={11} title="Responsabilité">
          <p>ShahnBid n'est pas responsable des dommages, pertes, retards ou litiges liés à l'exécution du transport,
          qui relèvent de la responsabilité du Transporteur et, le cas échéant, du Chargeur. La responsabilité de
          ShahnBid, si elle était engagée au titre du service de mise en relation, serait limitée au montant des
          commissions perçues sur la transaction concernée.</p>
        </Article>

        <Article n={12} title="Marchandises interdites">
          <p>Sont notamment interdits : produits illicites, stupéfiants, armes, espèces protégées, contrefaçons, ainsi
          que toute marchandise dont le transport n'est pas conforme à la réglementation applicable. Les marchandises
          dangereuses doivent être déclarées et transportées conformément aux règles en vigueur.</p>
        </Article>

        <Article n={13} title="Données personnelles et communications">
          <p>ShahnBid traite les données personnelles conformément à la loi 09-08 relative à la protection des données
          personnelles au Maroc. En s'inscrivant, l'utilisateur consent à recevoir des notifications de service par
          email. Les notifications par WhatsApp sont strictement optionnelles et nécessitent un consentement explicite,
          révocable à tout moment dans les paramètres.</p>
        </Article>

        <Article n={14} title="Propriété intellectuelle">
          <p>La Plateforme, sa marque et ses contenus sont protégés. Aucune reproduction ou exploitation n'est autorisée
          sans accord écrit de ShahnBid.</p>
        </Article>

        <Article n={15} title="Suspension et résiliation">
          <p>ShahnBid peut suspendre ou résilier un compte en cas de manquement aux présentes CGU, de fraude, ou de
          comportement portant atteinte à la Plateforme ou à ses utilisateurs.</p>
        </Article>

        <Article n={16} title="Droit applicable et litiges">
          <p>Les présentes CGU sont régies par le droit marocain. À défaut de résolution amiable, tout litige sera
          soumis aux tribunaux compétents de Casablanca.</p>
        </Article>

        <Article n={17} title="Modification des CGU">
          <p>ShahnBid peut modifier les présentes CGU. Les utilisateurs sont informés des changements substantiels ;
          la poursuite de l'utilisation vaut acceptation de la version mise à jour.</p>
        </Article>

        <p className="mt-8 text-sm text-gray-500">Contact : support@shahnbid.ma</p>

        <div className="mt-8 pt-5 border-t border-brand-border flex gap-4 text-sm">
          <Link href="/register/client" className="text-brand-primary font-medium hover:underline">Inscription chargeur</Link>
          <Link href="/register/carrier" className="text-brand-primary font-medium hover:underline">Inscription transporteur</Link>
        </div>
      </main>
    </div>
  );
}
